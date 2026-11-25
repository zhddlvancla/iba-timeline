/* IBA 기록 지구본. Globe.gl은 지도 창을 열 때 불러온다. */
(() => {
  const dataRoot = 'assets/geography/';
  const koreanNamesFile = 'names-ko.js?v=20261118';
  const dataVersion = '20261124';
  const jsonCache = new Map();
  let libraryPromise;
  let landImage;

  // 클래식 스크립트로 읽어 파일로 연 미리보기에서도 같은 지리 자료를 사용한다.
  function loadScript(file) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      // 지도 자료를 고치면 dataVersion을 올려 브라우저에 남은 옛 파일을 쓰지 않게 한다.
      script.src = dataRoot + file + (file.includes('?') ? '' : `?v=${dataVersion}`);
      script.onload = () => {
        script.remove();
        resolve(script.ibaMapData);
      };
      script.onerror = () => {
        script.remove();
        reject(new Error(`지도 파일을 읽지 못했습니다: ${file}`));
      };
      document.head.append(script);
    });
  }

  function readData(file) {
    if (!jsonCache.has(file)) {
      const request = loadScript(file).then(payload => {
        if (typeof payload === 'string') {
          const bytes = Uint8Array.from(atob(payload), character => character.charCodeAt(0));
          const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
          return new Response(stream).json();
        }
        if (!payload) throw new Error(`지도 파일에 자료가 없습니다: ${file}`);
        return payload;
      }).catch(error => {
        if (jsonCache.get(file) === request) jsonCache.delete(file);
        throw error;
      });
      // 연도를 오래 탐색해도 이미 지나간 모든 구간을 보관하지 않는다.
      if (jsonCache.size >= 8) {
        const old = [...jsonCache.keys()].find(key => key !== 'manifest.js' && key !== koreanNamesFile);
        jsonCache.delete(old);
      }
      jsonCache.set(file, request);
    }
    return jsonCache.get(file);
  }

  function loadLibrary() {
    if (libraryPromise) return libraryPromise;
    libraryPromise = loadScript('globe.gl.min.js').then(() => {
      if (typeof window.Globe !== 'function') throw new Error('Globe.gl 초기화 실패');
      return window.Globe;
    }).catch(error => {
      libraryPromise = null;
      throw error;
    });
    return libraryPromise;
  }

  const features = data => Array.isArray(data) ? data : data.features;
  const polygons = geometry => geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  const modernCountryNames = {
    CHN: '중국', ESP: '에스파냐', GBR: '영국', PRK: '북한', TUR: '튀르키예', TWN: '타이완', USA: '미국'
  };

  // 원자료가 여러 시기를 한 이름으로 묶은 경우, 기록에서 확인되는 기간에만 세부 명칭을 쓴다.
  const historicalNamePeriods = {
    Babylonia: [[-1894, -1500, '바빌로니아 왕국']],
    'French Indochina': [[1887, 1954, '프랑스령 인도차이나 연방']],
    'Han Dynasty': [[-202, 8, '전한(前漢)'], [25, 220, '후한(後漢)']],
    'Macedonian Empire': [[-336, -323, '알렉산드로스 제국']],
    'Middle Franks': [[843, 855, '중프랑크 왕국']],
    'Sultanate of Malacca': [[1402, 1511, '믈라카 왕국']]
  };

  function boundaryName(properties, year, koreanNames) {
    if (year === null) return modernCountryNames[properties.id] || properties.nameKo || '이름 미등재';

    const { name } = properties;
    const aggregate = name.startsWith('(') && name.endsWith(')');
    const sourceName = aggregate ? name.slice(1, -1) : name;
    const label = historicalNamePeriods[sourceName]?.find(([start, end]) => start <= year && year <= end)?.[2];
    // 감사본 교정: 같은 영역에서 국호·지위가 바뀐 해에는 그 시기의 표시명을 쓴다 (tools/geography_corrections.py).
    const corrected = label || properties.labelKo;
    if (!corrected) return koreanNames[name] || '이름 미등재';
    return aggregate ? `(${corrected})` : corrected;
  }

  // Natural Earth의 육지 윤곽을 구 표면에 한 번 그린다. 현대 국경은 여기에 그리지 않는다.
  function drawLand(data) {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const context = canvas.getContext('2d');
    context.fillStyle = '#08140e';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#122b1c';
    context.strokeStyle = '#285039';
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
    context.strokeStyle = 'rgba(87, 193, 128, .15)';
    context.beginPath();
    for (let longitude = -170; longitude <= 170; longitude += 10) {
      const x = (longitude + 180) / 360 * canvas.width;
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
    }
    for (let latitude = -80; latitude <= 80; latitude += 10) {
      const y = (90 - latitude) / 180 * canvas.height;
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
    }
    context.stroke();
    return canvas.toDataURL('image/png');
  }

  function boundaryRegions(data, year, koreanNames) {
    return features(data).flatMap(({ geometry, properties }, index) => {
      if (!geometry || (year !== null && !(properties.start <= year && year <= properties.end))) return [];
      return [{
        id: `boundary:${properties.id ?? index}:${index}`,
        label: boundaryName(properties, year, koreanNames),
        sourceName: properties.name || '',
        kind: 'boundary',
        geometry
      }];
    });
  }

  const wrapLongitude = longitude => ((longitude + 180) % 360 + 360) % 360 - 180;

  // 여러 조각 중 넓은 영토를 고르고, 내부의 넓은 구간에 이름을 놓는다.
  // 바깥 윤곽과 호수 등 내부 구멍을 함께 잘라 이름의 기준점이 영토 안에 오도록 한다.
  function labelAnchor(geometry) {
    let bestArea = 0, largest;
    for (const polygon of polygons(geometry)) {
      const reference = polygon[0][0][0];
      const rings = polygon.map(ring => {
        let previous = reference;
        return ring.map(([lng, lat]) => {
          previous += wrapLongitude(lng - previous);
          return [previous, lat];
        });
      });
      const outer = rings[0];
      let area = 0, minLat = 90, maxLat = -90;
      for (let i = 1; i < outer.length; i++) {
        const [x0, y0] = outer[i - 1], [x1, y1] = outer[i];
        area += (x0 - reference) * y1 - (x1 - reference) * y0;
        minLat = Math.min(minLat, y1);
        maxLat = Math.max(maxLat, y1);
      }
      area = Math.abs(area) / 2 * Math.cos((minLat + maxLat) * Math.PI / 360);
      if (area > bestArea) {
        bestArea = area;
        largest = { rings, minLat, maxLat };
      }
    }
    if (!largest) return null;

    const { rings, minLat, maxLat } = largest;
    let anchor = null, bestScore = 0;
    for (const fraction of [0.5, 0.32, 0.68, 0.16, 0.84]) {
      const lat = minLat + (maxLat - minLat) * fraction;
      const crossings = [];
      for (const ring of rings) {
        for (let i = 1; i < ring.length; i++) {
          const [x0, y0] = ring[i - 1], [x1, y1] = ring[i];
          if ((y0 > lat) !== (y1 > lat)) crossings.push(x0 + (x1 - x0) * (lat - y0) / (y1 - y0));
        }
      }
      crossings.sort((a, b) => a - b);
      for (let i = 0; i + 1 < crossings.length; i += 2) {
        const left = crossings[i], right = crossings[i + 1];
        const score = (right - left) * (1 - Math.abs(fraction - 0.5));
        if (score > bestScore) {
          bestScore = score;
          anchor = { lat, lng: wrapLongitude((left + right) / 2), span: right - left, area: bestArea };
        }
      }
    }
    return anchor;
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

  // 노드의 장소를 품은 국경을 고른다. 그중 노드 이름과 같은 국경이 있으면 그것만,
  // 없으면 괄호로 묶인 상위 집합명을 뺀 개별 정치체를, 그것도 없으면 집합명을 쓴다.
  const baseName = text => (text || '').replace(/\(.*?\)/g, '').replace(/\s+/g, '');
  function focusRegions(regions, places, focusLabel) {
    if (!places.length || !window.IBA_GLOBE_RECORDS) return new Set();
    const { contains } = window.IBA_GLOBE_RECORDS;
    const hits = regions.filter(region => places.some(place => contains(place, region.geometry)));
    const title = baseName(focusLabel);
    const named = title ? hits.filter(region => {
      const name = baseName(region.label);
      return name && (title.includes(name) || name.includes(title));
    }) : [];
    const own = hits.filter(region => !region.sourceName.startsWith('('));
    return new Set((named.length ? named : own.length ? own : hits).map(region => region.id));
  }

  function tooltip(item) {
    const label = document.createElement('span');
    label.textContent = item.label;
    return label;
  }

  function mount(element, { year, view, points = [], showLabels = false, focusPlaces = [], focusLabel = '', onRegion, onStatus }) {
    const home = { lat: view.lat, lng: view.lng, altitude: view.altitude ?? 2.25 };
    let disposed = false;
    let revision = 0;
    let globe;
    let resize;
    let selected;
    // 노드에서 연 지도는 그 기록의 장소를 품은 국경만 처음부터 색을 켠다.
    let focused = new Set();
    let regions = [];
    let mapLabels = [];
    let labelFrame = null;
    const overlayElements = new Map();
    const globeFacing = new WeakMap();
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
      // 평소에는 경계선만 그리고, 선택한 국경과 노드의 해당 국경만 면을 채운다.
      const lit = region => region.id === selected || focused.has(region.id);
      globe
        // 완전 투명(0)이면 라이브러리가 면을 그리지 않아 클릭도 잡히지 않으므로 보이지 않을 만큼만 남긴다.
        .polygonCapColor(region => lit(region) ? 'rgba(54, 174, 101, 0.5)' : 'rgba(8, 20, 14, 0.02)')
        .polygonSideColor(region => lit(region) ? 'rgba(54, 174, 101, 0.35)' : 'rgba(0, 0, 0, 0)')
        .polygonStrokeColor(region => region.id === selected ? '#c4ffd9' : lit(region) ? '#86f0ae' : '#4daf70');
      for (const point of points) overlayElements.get(point.id)?.classList.toggle('is-selected', point.id === selected);
      scheduleLabels();
    };
    function pick(region, move = false) {
      if (disposed) return;
      selected = region.id;
      renderSelection();
      if (move && globe) {
        const { lat, lng } = mapLabels.find(item => item.id === region.id) || regionView(region);
        globe.pointOfView({ lat, lng }, 280);
      }
      onRegion(region);
    }
    const pickOnGlobe = region => { if (!dragged) pick(region); };
    const gestures = {
      pointerdown: startGesture, pointermove: moveGesture, pointerup: endGesture, pointercancel: endGesture
    };
    for (const [event, handler] of Object.entries(gestures)) element.addEventListener(event, handler, true);

    function makeOverlay(item) {
      const isLabel = item.kind === 'boundary';
      const overlay = document.createElement(isLabel ? 'span' : 'button');
      overlay.className = isLabel ? 'iba-globe__country-label' : 'iba-globe__record-marker';
      if (isLabel) {
        overlay.textContent = item.label;
        overlay.setAttribute('aria-hidden', 'true');
      } else {
        overlay.type = 'button';
        overlay.title = item.label;
        overlay.setAttribute('aria-label', `기록 지점 · ${item.label}`);
        overlay.tabIndex = -1; // 국가·지역 목록에서도 같은 지점을 선택할 수 있다.
        overlay.classList.toggle('is-selected', item.id === selected);
        // Globe.gl은 pointerup에서 뒤쪽 영역을 선택하므로 네모 버튼의 조작과 분리한다.
        for (const type of ['pointerdown', 'pointerup']) {
          overlay.addEventListener(type, event => event.stopPropagation());
        }
        overlay.addEventListener('click', event => {
          event.stopPropagation();
          pickOnGlobe(item);
        });
      }
      overlay.style.visibility = 'hidden';
      overlayElements.set(item.id, overlay);
      return overlay;
    }

    function scheduleLabels() {
      if (!mapLabels.length || labelFrame !== null) return;
      labelFrame = requestAnimationFrame(() => {
        labelFrame = null;
        const placed = [];
        const width = element.clientWidth, height = element.clientHeight;
        const preferred = mapLabels.find(item => item.id === selected);
        const labels = preferred ? [preferred, ...mapLabels.filter(item => item !== preferred)] : mapLabels;
        for (const item of labels) {
          const label = overlayElements.get(item.id);
          if (!label) continue;
          let visible = false;
          if (globeFacing.get(label) && label.isConnected) {
            const { x, y } = globe.getScreenCoords(item.lat, item.lng, 0.012);
            const halfW = label.offsetWidth / 2 + 3, halfH = label.offsetHeight / 2 + 2;
            const east = globe.getScreenCoords(item.lat, item.lng + Math.min(item.span / 2, 18), 0.012);
            const west = globe.getScreenCoords(item.lat, item.lng - Math.min(item.span / 2, 18), 0.012);
            const projectedWidth = Math.hypot(east.x - west.x, east.y - west.y);
            const box = { left: x - halfW, right: x + halfW, top: y - halfH, bottom: y + halfH };
            visible = (item === preferred || projectedWidth >= label.offsetWidth * 0.72) &&
              box.left >= 4 && box.right <= width - 4 && box.top >= 4 && box.bottom <= height - 4 &&
              !placed.some(other => box.left < other.right && box.right > other.left && box.top < other.bottom && box.bottom > other.top);
            if (visible) placed.push(box);
          }
          label.style.visibility = visible ? 'visible' : 'hidden';
        }
      });
    }

    function showOverlays() {
      if (!globe) return;
      const items = [...mapLabels, ...points];
      const ids = new Set(items.map(item => item.id));
      for (const id of overlayElements.keys()) {
        if (!ids.has(id)) overlayElements.delete(id);
      }
      globe.htmlElementsData(items);
      scheduleLabels();
    }

    Promise.all([
      loadLibrary(),
      readData('land.js').catch(() => null)
    ]).then(([Globe, land]) => {
      if (disposed) return;
      globe = new Globe(element, {
        animateIn: false, waitForGlobeReady: false,
        rendererConfig: { antialias: true, alpha: false }
      });
      globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      if (land) {
        landImage ||= drawLand(land);
        globe.globeImageUrl(landImage);
      } else {
        globe.globeMaterial().color.set('#122b1c');
        rendererNotice = '육지 윤곽 자료를 불러오지 못했습니다.';
      }
      globe
        .backgroundColor('#040806')
        .showAtmosphere(true)
        .atmosphereColor('#36ae65')
        .atmosphereAltitude(0.08)
        .polygonGeoJsonGeometry('geometry')
        .polygonAltitude(0.009)
        .polygonCapCurvatureResolution(5)
        .polygonsTransitionDuration(0)
        .polygonLabel(tooltip)
        .onPolygonClick(pickOnGlobe)
        .polygonsData(regions)
        .htmlAltitude(item => item.kind === 'boundary' ? 0.012 : 0.018)
        .htmlTransitionDuration(0)
        .htmlElement(makeOverlay)
        .htmlElementVisibilityModifier((overlay, front) => {
          if (overlay.classList.contains('iba-globe__country-label')) {
            globeFacing.set(overlay, front);
            scheduleLabels();
          } else {
            overlay.style.visibility = front ? 'visible' : 'hidden';
          }
        })
        .onZoom(scheduleLabels)
        .onGlobeClick(({ lat, lng }) => pickOnGlobe({ id: '', label: '선택한 위치', kind: 'unmapped', lat, lng }));
      const radius = globe.getGlobeRadius();
      globe.controls().minDistance = radius * 1.26;
      globe.controls().maxDistance = radius * 5;
      resize = new ResizeObserver(() => {
        if (globe && element.clientWidth && element.clientHeight) globe.width(element.clientWidth).height(element.clientHeight);
        scheduleLabels();
      });
      resize.observe(element);
      renderSelection();
      showOverlays();
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
      if (labelFrame !== null) cancelAnimationFrame(labelFrame);
      labelFrame = null;
      if (globe) {
        const renderer = globe.renderer();
        // 공식 UMD의 해제 훅으로 애니메이션과 OrbitControls를 정리한다.
        globe._destructor();
        renderer.dispose();
        renderer.forceContextLoss();
        globe = null;
      }
      overlayElements.clear();
      element.replaceChildren();
    }

    async function setYear(nextYear) {
      const request = ++revision;
      selected = '';
      regions = [];
      mapLabels = [];
      globe?.polygonsData([]);
      showOverlays();
      renderSelection();
      report({ state: 'loading', message: '국경 자료를 불러오는 중입니다.' });
      try {
        const { modern, historical } = await readData('manifest.js');
        const entry = nextYear === null ? modern : historical.chunks.find(chunk => chunk.start <= nextYear && nextYear <= chunk.end);
        if (request !== revision || disposed) return;
        if (!entry || nextYear === 0) {
          report({ state: 'unavailable', message: '이 연도의 역사 국경 자료가 없습니다.' });
          return;
        }
        const [data, koreanNames] = await Promise.all([
          readData(entry.file), nextYear === null ? {} : readData(koreanNamesFile)
        ]);
        if (request !== revision || disposed) return;
        regions = boundaryRegions(data, nextYear, koreanNames);
        focused = focusRegions(regions, focusPlaces, focusLabel);
        if (showLabels) {
          mapLabels = regions.flatMap(region => {
            const anchor = labelAnchor(region.geometry);
            return anchor ? [{ ...anchor, id: region.id, label: region.label, kind: region.kind }] : [];
          }).sort((a, b) => b.area - a.area);
        }
        globe?.polygonsData(regions);
        renderSelection();
        showOverlays();
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
        showOverlays();
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
