/* IBA 기록 지구본. Globe.gl은 지도 창을 열 때 불러온다. */
(() => {
  const dataRoot = 'assets/geography/';
  const jsonCache = new Map();
  let libraryPromise;
  let landImage;

  function readData(file) {
    if (!jsonCache.has(file)) {
      const request = fetch(dataRoot + file).then(response => {
        if (!response.ok) throw new Error(`지도 자료 HTTP ${response.status}`);
        if (file.endsWith('.gz')) {
          const stream = response.body.pipeThrough(new DecompressionStream('gzip'));
          return new Response(stream).json();
        }
        return response.json();
      }).catch(error => {
        if (jsonCache.get(file) === request) jsonCache.delete(file);
        throw error;
      });
      // 연도를 오래 탐색해도 이미 지나간 모든 구간을 보관하지 않는다.
      if (jsonCache.size >= 8) {
        const old = [...jsonCache.keys()].find(key => key !== 'manifest.json');
        jsonCache.delete(old);
      }
      jsonCache.set(file, request);
    }
    return jsonCache.get(file);
  }

  function loadLibrary() {
    if (libraryPromise) return libraryPromise;
    libraryPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = dataRoot + 'globe.gl.min.js';
      script.onload = () => {
        if (typeof window.Globe === 'function') resolve(window.Globe);
        else reject(new Error('Globe.gl 초기화 실패'));
      };
      script.onerror = () => reject(new Error('Globe.gl 로드 실패'));
      document.head.append(script);
    }).catch(error => {
      libraryPromise = null;
      throw error;
    });
    return libraryPromise;
  }

  const features = data => Array.isArray(data) ? data : data.features;
  const polygons = geometry => geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;

  // Natural Earth의 육지 윤곽을 구 표면에 한 번 그린다. 현대 국경은 여기에 그리지 않는다.
  function drawLand(data) {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const context = canvas.getContext('2d');
    context.fillStyle = '#102520';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#375442';
    context.strokeStyle = '#54725c';
    context.lineWidth = 1;
    for (const feature of features(data)) {
      for (const polygon of polygons(feature.geometry)) {
        context.beginPath();
        for (const ring of polygon) {
          ring.forEach(([lng, lat], i) => {
            const x = (lng + 180) / 360 * canvas.width;
            const y = (90 - lat) / 180 * canvas.height;
            if (i === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
          });
          context.closePath();
        }
        context.fill('evenodd');
        context.stroke();
      }
    }
    return canvas.toDataURL('image/png');
  }

  function boundaryRegions(data, year) {
    return features(data).flatMap(({ geometry, properties }, index) => {
      if (!geometry || (year !== null && !(properties.start <= year && year <= properties.end))) return [];
      return [{
        id: `boundary:${properties.id ?? index}:${index}`,
        label: properties.nameKo || properties.name,
        kind: 'boundary',
        geometry
      }];
    });
  }

  // 목록으로 지역을 고를 때는 가장 큰 외곽선의 대략적인 중앙으로 카메라를 이동한다.
  function regionView(region) {
    if (Number.isFinite(region.lat) && Number.isFinite(region.lng)) return region;
    const rings = polygons(region.geometry).map(polygon => polygon[0]);
    const ring = rings.reduce((longest, next) => next.length > longest.length ? next : longest);
    let x = 0, y = 0, latitudes = 0;
    for (const [lng, lat] of ring) {
      const angle = lng * Math.PI / 180;
      x += Math.cos(angle);
      y += Math.sin(angle);
      latitudes += lat;
    }
    return { lat: latitudes / ring.length, lng: Math.atan2(y, x) * 180 / Math.PI };
  }

  function tooltip(item) {
    const label = document.createElement('span');
    label.textContent = item.label;
    return label;
  }

  function mount(element, { year, view, points = [], onRegion, onStatus }) {
    const home = { lat: view.lat, lng: view.lng, altitude: view.altitude ?? 2.25 };
    let disposed = false;
    let revision = 0;
    let globe;
    let resize;
    let selected;
    let regions = [];
    let rendererNotice = '';
    const pointers = new Map();
    let dragged = false;

    const startGesture = event => {
      if (!pointers.size) dragged = false;
      pointers.set(event.pointerId, [event.clientX, event.clientY]);
      if (pointers.size > 1) dragged = true;
    };
    const moveGesture = event => {
      const start = pointers.get(event.pointerId);
      if (start && Math.hypot(event.clientX - start[0], event.clientY - start[1]) > 6) dragged = true;
    };
    const endGesture = event => {
      moveGesture(event);
      pointers.delete(event.pointerId);
    };
    // WebGL이 없는 기기에서도 선택 목록과 IBA 기록 연결은 동작한다.
    let status = { state: 'loading', message: '국경 자료를 불러오는 중입니다.', regions };
    const report = update => {
      if (disposed) return;
      status = { ...update, regions };
      onStatus({ ...status, interactive: !!globe, message: [status.message, rendererNotice].filter(Boolean).join(' ') });
    };
    const renderSelection = () => {
      if (!globe) return;
      globe
        .polygonCapColor(region => region.id === selected ? '#8da66d' : '#416b50')
        .polygonStrokeColor(region => region.id === selected ? '#e7ed9f' : '#8ab594')
        .pointColor(point => point.id === selected ? '#fff4b5' : '#e5b972');
    };
    function pick(region, move = false) {
      if (disposed) return;
      selected = region.id;
      renderSelection();
      if (move && globe) {
        const { lat, lng } = regionView(region);
        globe.pointOfView({ lat, lng }, 280);
      }
      onRegion(region);
    }
    const pickOnGlobe = region => { if (!dragged) pick(region); };
    const gestures = {
      pointerdown: startGesture, pointermove: moveGesture, pointerup: endGesture, pointercancel: endGesture
    };
    for (const [event, handler] of Object.entries(gestures)) element.addEventListener(event, handler, true);

    const manifest = readData('manifest.json');
    Promise.all([
      loadLibrary(),
      manifest.then(data => readData(data.land.file))
    ]).then(([Globe, land]) => {
      if (disposed) return;
      landImage ||= drawLand(land);
      globe = new Globe(element, {
        animateIn: false, waitForGlobeReady: false,
        rendererConfig: { antialias: true, alpha: false }
      });
      globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      globe
        .backgroundColor('#091513')
        .globeImageUrl(landImage)
        .showAtmosphere(true)
        .atmosphereColor('#699484')
        .atmosphereAltitude(0.11)
        .showGraticules(true)
        .polygonGeoJsonGeometry('geometry')
        .polygonAltitude(0.009)
        .polygonCapCurvatureResolution(5)
        .polygonSideColor(() => '#254638')
        .polygonsTransitionDuration(0)
        .polygonLabel(tooltip)
        .onPolygonClick(pickOnGlobe)
        .polygonsData(regions)
        .pointRadius(0.62)
        .pointAltitude(0.022)
        .pointsTransitionDuration(0)
        .pointLabel(tooltip)
        .onPointClick(pickOnGlobe)
        .pointsData(points)
        .onGlobeClick(({ lat, lng }) => pickOnGlobe({ id: '', label: '선택한 위치', kind: 'unmapped', lat, lng }));
      const radius = globe.getGlobeRadius();
      globe.controls().minDistance = radius * 1.26;
      globe.controls().maxDistance = radius * 5;
      resize = new ResizeObserver(() => {
        if (globe && element.clientWidth && element.clientHeight) globe.width(element.clientWidth).height(element.clientHeight);
      });
      resize.observe(element);
      renderSelection();
      globe.pointOfView(home);
      report(status);
    }).catch(() => {
      if (disposed) return;
      releaseGlobe();
      rendererNotice = '이 기기에서 지구본을 표시할 수 없습니다. 지역 목록으로 기록을 찾을 수 있습니다.';
      report(status);
    });

    function releaseGlobe() {
      resize?.disconnect();
      if (globe) {
        const renderer = globe.renderer();
        // 공식 UMD의 해제 훅으로 애니메이션과 OrbitControls를 정리한다.
        globe._destructor();
        renderer.dispose();
        renderer.forceContextLoss();
        globe = null;
      }
      element.replaceChildren();
    }

    async function setYear(nextYear) {
      const request = ++revision;
      selected = '';
      regions = [];
      globe?.polygonsData([]);
      renderSelection();
      report({ state: 'loading', message: '국경 자료를 불러오는 중입니다.' });
      try {
        const { modern, historical } = await manifest;
        const entry = nextYear === null ? modern : historical.chunks.find(chunk => chunk.start <= nextYear && nextYear <= chunk.end);
        if (request !== revision || disposed) return;
        if (!entry || nextYear === 0) {
          report({ state: 'unavailable', message: '이 연도의 역사 국경 자료가 없습니다.' });
          return;
        }
        const data = await readData(entry.file);
        if (request !== revision || disposed) return;
        regions = boundaryRegions(data, nextYear);
        globe?.polygonsData(regions);
        report(regions.length
          ? { state: 'ready', message: '' }
          : { state: 'unavailable', message: '이 연도의 역사 국경 자료가 없습니다.' });
      } catch {
        if (request === revision) report({ state: 'error', message: '국경 자료를 불러오지 못했습니다. 연도를 다시 선택해 주세요.' });
      }
    }

    setYear(year);
    return {
      setYear,
      setSelected(id) {
        selected = id;
        renderSelection();
      },
      setPoints(nextPoints) {
        points = nextPoints;
        globe?.pointsData(points);
      },
      select(id) {
        const region = regions.find(item => item.id === id) || points.find(item => item.id === id);
        if (region) pick(region, true);
      },
      zoom(delta) {
        if (!globe) return;
        const { altitude } = globe.pointOfView();
        globe.pointOfView({ altitude: Math.max(0.26, Math.min(4, altitude * (delta > 0 ? 0.72 : 1.38))) }, 170);
      },
      reset() {
        globe?.pointOfView(home, 280);
      },
      destroy() {
        disposed = true;
        for (const [event, handler] of Object.entries(gestures)) element.removeEventListener(event, handler, true);
        releaseGlobe();
      }
    };
  }

  window.IBA_GLOBE = { mount };
})();
