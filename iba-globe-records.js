/* IBA 지도 위치 색인. 지명과 기록 연결은 기존 기록의 지리 조사·상세·시대 표기를 따르며,
   점은 기록과 관련된 도시 또는 지역의 대략적 위치다. 경계·영유권을 나타내지 않는다.
   일부 도시 좌표는 Natural Earth 10m Populated Places 5.1.2 (public domain)에서 확인·반올림했다.
   https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-populated-places/
   https://www.naturalearthdata.com/about/terms-of-use/ */
(function (global) {
  "use strict";

  // [표시 지명, 위도, 경도, 공백으로 구분한 기록 ID]
  const places = [
    // 한반도와 한국사 기록의 국외 지점
    ["서울·한양", 37.57, 127,
      "k-neolithic k-baekje k-goi k-geunchogo k-chimnyu k-gaero k-joseon k-js-taejo " +
      "k-js-taejong k-js-sejong k-js-sejo k-js-seongjong k-js-hungu-sarim k-js-muo k-js-gapja k-js-gimyo " +
      "k-js-eulsa k-js-gwanghae k-js-yesong k-js-hwanguk k-js-yeongjo k-js-jeongjo k-js-sedo k-daewongun " +
      "k-imo k-gapsin k-gabo k-agwan k-korean-empire k-eulsa k-annexation k-company-law " +
      "k-samil k-610 k-singanhoe k-geunuhoe k-geonguk k-joseoneo k-era-mudan k-era-munhwa " +
      "k-era-malsal k-liberation k-geonjun k-jointcomm1 k-jointcomm2 k-jwau k-constitution k-rok " +
      "k-gov-rhee k-625 k-gov-chang k-gov-park k-gov-choi k-gov-chun k-gov-roh k-gov-kys " +
      "k-gov-kdj k-gov-rmh k-gov-lmb k-gov-pgh k-gov-moon k-gov-yoon w-jointcomm1 w-jointcomm2"],
    ["평양·서경", 39.02, 125.75,
      "k-gojoseon k-bronze k-goguryeo-tang k-jangsu k-gr-myocheong k-samil k-mulsan k-liberation " +
      "k-nambuk k-625"],
    ["한반도", 36.3, 127.7,
      "k-land-survey k-flogging k-uigunbu k-minrip k-sanmi k-vnarod k-oath k-mobilization " +
      "k-soshi k-510 k-era-econ12 k-era-econ34"],
    ["한반도 남부", 35.9, 127.9, "k-samhan"],
    ["연천", 38.02, 127.06, "k-paleo"],
    ["공주·웅진", 36.46, 127.12, "k-paleo k-munju k-muryeong"],
    ["부여·사비", 36.28, 126.91, "k-seong"],
    ["황해도 신천 일대", 38.35, 125.49, "k-bronze"],
    ["창원 다호리 일대", 35.34, 128.68, "k-iron"],
    ["경주", 35.84, 129.21, "k-silla k-naemul k-jijeung k-beopheung k-jinheung k-era-samguk k-unify"],
    ["김해", 35.23, 128.88, "k-gaya k-gaya-early"],
    ["고령", 35.73, 128.26, "k-gaya-late"],
    ["개성·개경", 37.96, 126.56,
      "k-goryeo k-gr-taejo k-gr-gwangjong k-gr-seongjong k-gr-khitan k-gr-yijagyeom k-gr-musin k-gr-yuan " +
      "k-gr-gongmin k-gr-decline"],
    ["강화도", 37.72, 126.46, "k-gr-mongol k-js-jeongmyo k-sinmi k-ganghwa-treaty"],
    ["남한산성 일대", 37.48, 127.18, "k-js-byeongja"],
    ["진주", 35.19, 128.08, "k-imsul k-hyeongpyeong"],
    ["부산", 35.1, 129.01, "k-neolithic k-js-imjin k-625"],
    ["전라도", 35.8, 127.14, "k-js-jeongyu k-donghak-rev"],
    ["대구", 35.87, 128.6, "k-gukchae k-gwangbokhoe"],
    ["암태도", 34.83, 126.1, "k-amtae"],
    ["원산", 39.16, 127.43, "k-wonsan"],
    ["광주", 35.17, 126.91, "k-gwangju-student"],
    ["제주", 33.51, 126.52, "k-jeju43"],
    ["여수·순천", 34.83, 127.67, "k-yeosun"],
    ["함경도 동해안", 39.91, 127.54, "k-okjeo"],
    ["강원 북부 동해안", 38.21, 128.6, "k-dongye"],
    ["한반도 북부·남만주", 40.87, 126.3, "k-gr-jurchen"],
    ["송화강 유역", 43.85, 126.55, "k-buyeo"],
    ["압록강 중류", 41.12, 126.19, "k-goguryeo k-taejo k-gogukcheon k-micheon k-gogugwon k-sosurim k-gwanggaeto k-era-samguk"],
    ["랴오닝", 41.28, 123.18, "k-gojoseon k-bronze k-mitsuya"],
    // 살수와 청천강의 지명 대조: https://encykorea.aks.ac.kr/Article/E0026415
    ["청천강 유역", 39.64, 125.66, "k-goguryeo-sui"],
    ["한반도 중부", 37.16, 127.18, "k-nadang"],
    ["둔화·동모산 일대", 43.35, 128.22, "k-balhae"],
    ["서간도", 42.17, 125.82, "k-sinheung k-uiyeoldan"],
    ["간도", 42.88, 129.51, "k-bongodong k-cheongsanri k-gando"],
    ["자유시", 51.4, 128.13, "k-jayusi"],
    ["상하이", 31.22, 121.43, "k-provisional k-national-rep k-hanin"],
    ["도쿄", 35.69, 139.75, "k-28 k-samil k-kanto k-peace-law k-hanin e-meiji e-edo e-jiyu-minken e-jp-expansion"],
    ["난징·건강", 32.05, 118.78, "k-minhyeok e-dongjin e-taiping e-ming"],
    ["우한", 30.58, 114.27, "k-uiyongdae e-xinhai"],
    ["충칭", 29.57, 106.59, "k-gwangbokgun k-founding-plan"],
    ["옌안", 36.59, 109.47, "k-hwabuk"],
    ["모스크바", 55.75, 37.61, "k-moscow w-moscow w-russia w-stalin"],
    ["뉴욕 일대", 40.75, -73.98, "k-un-ga k-un-little w-un-ga w-un-little w-depression"],
    // 동아시아
    ["산시성 황허 유역", 34.48, 109.8, "e-paleo"],
    ["안양·은허", 36.08, 114.35, "e-shang"],
    ["뤄양·낙양 일대", 34.64, 112.44, "e-neolithic e-bronze e-xia e-chunqiu-zhanguo e-later-han e-wei-jin-nbc e-3kingdoms e-jin e-wuhu"],
    ["시안·장안 일대", 34.28, 108.89, "e-zhou e-han-founded e-wang e-sui e-tang"],
    ["셴양·함양", 34.34, 108.71, "e-qin"],
    ["몽골 고원", 47.9, 106.89, "e-xiongnu e-mongol"],
    ["다퉁·평성", 40.08, 113.3, "e-beiwei"],
    ["혼슈 북부", 40.83, 140.74, "e-jomon"],
    ["규슈 북부", 33.6, 130.41, "e-yayoi"],
    ["나라 일대", 34.66, 135.79, "e-yamato e-asuka e-nara"],
    ["교토", 35.03, 135.75, "e-heian e-muromachi"],
    ["가마쿠라", 35.32, 139.55, "e-kamakura"],
    ["일본 중부", 35.19, 136.91, "e-sengoku"],
    ["카이펑", 34.79, 114.36, "e-5dai e-song"],
    ["요서", 42.27, 118.97, "e-liao"],
    ["닝샤 일대", 38.47, 106.27, "e-xixia"],
    ["만주·쑹화강 유역", 45.76, 126.64, "e-jin-jurchen"],
    ["항저우·임안", 30.25, 120.17, "e-nansong"],
    ["베이징", 39.9, 116.39,
      "e-yuan e-ming-fall e-china-change e-china-nat e-new-culture e-boxer e-bianfa e-mq-society " +
      "e-mq-economy e-mq-culture e-may4 e-civilwar e-nixon e-reform"],
    ["랴오둥", 41.8, 123.43, "e-houjin e-qing"],
    ["시모다", 34.68, 138.95, "e-japan-open"],
    ["광저우", 23.13, 113.26, "e-china-open e-opium e-opium2 e-yangwu"],
    ["하노이", 21.03, 105.85, "e-vietnam-nat e-dr-vietnam"],
    ["후에", 16.47, 107.58, "e-nguyen"],
    ["사이공", 10.78, 106.7, "e-vietwar-end"],
    // 유럽·미주
    // 아타푸에르카 유적의 위치: https://whc.unesco.org/en/list/989/
    ["아타푸에르카 일대", 42.35, -3.52, "w-paleo"],
    ["영국 남부", 51.18, -1.83, "w-neolithic"],
    ["나일강 유역", 29.88, 31.23, "w-egypt-civ"],
    ["크레타·크노소스", 35.3, 25.16, "w-aegean w-bronze"],
    ["메소아메리카", 18.06, -94.76, "w-america"],
    ["멕시코 고원·테노치티틀란", 19.43, -99.13, "w-aztec-civ"],
    ["쿠스코", -13.52, -71.97, "w-inca-civ"],
    ["아테네", 37.98, 23.73, "w-greek-culture w-polis w-athens w-greco-persian w-peloponnesian"],
    ["스파르타", 37.07, 22.43, "w-sparta"],
    ["마케도니아 일대", 40.76, 22.52, "w-macedonia w-alexander-empire"],
    ["로마", 41.9, 12.48, "w-rome-found w-rome-rep w-rome-emp w-pax-romana w-soldier-emperors w-charlemagne w-schism w-great-schism w-papal-rise"],
    ["콘스탄티노폴리스", 41.02, 28.97, "w-byzantine w-iconoclasm w-schism s-tanzimat s-ottoman-nat s-young-turk"],
    ["갈리아 북부", 49.6, 3.32, "w-frank"],
    ["클뤼니", 46.44, 4.66, "w-cluny"],
    ["예루살렘 일대", 31.78, 35.21, "w-jesus w-crusade s-hebrew"],
    ["아비뇽", 43.95, 4.81, "w-great-schism w-papal-decline"],
    ["피렌체", 43.78, 11.25, "w-renaissance"],
    ["이베리아 서남부", 37.23, -6.89, "w-columbus"],
    ["런던·잉글랜드 남부", 51.5, -0.12, "w-hundred w-roses w-english-rev w-uk-liberal w-armada"],
    ["미들랜즈", 52.48, -1.89, "w-industrial"],
    ["파리", 48.86, 2.35, "w-hundred w-fr-liberal w-french-rev w-napoleonic w-ww1"],
    ["페트로그라드", 59.94, 30.31, "w-feb-rev-ru w-oct-rev-ru w-lenin w-ru-dev w-russia"],
    ["베를린", 52.52, 13.4, "w-de-unif w-germany w-unify w-ww1"],
    ["토리노", 45.07, 7.67, "w-it-unif w-italy"],
    ["비텐베르크", 51.87, 12.65, "w-luther"],
    ["필라델피아", 39.95, -75.18, "w-american-rev"],
    ["빈", 48.2, 16.37, "w-vienna w-ww1"],
    ["사라예보", 43.85, 18.41, "w-ww1"],
    ["바르샤바", 52.23, 21.01, "w-ww2"],
    ["우크라이나 중부", 49.1, 31.2, "w-ukraine"],
    // 서아시아·인도 및 아프리카 관련 기록
    ["드마니시 일대", 41.33, 44.34, "s-paleo"],
    ["차탈회위크 일대", 37.67, 32.83, "s-neolithic"],
    ["예리코 일대", 31.87, 35.45, "s-neolithic"],
    ["메소포타미아 하류", 30.96, 46.1, "s-bronze s-mesopotamia"],
    ["모헨조다로 일대", 27.33, 68.14, "s-indus"],
    ["하투샤 일대", 40.02, 34.61, "s-hittite"],
    ["티레", 33.27, 35.2, "s-phoenicia"],
    ["니네베 일대", 36.36, 43.15, "s-assyria"],
    ["갠지스강 중류", 25.63, 85.13, "s-buddhism s-jainism s-magadha s-gupta"],
    ["이란 서남부·페르세폴리스", 29.94, 52.89, "s-persia s-persia-culture"],
    ["크테시폰 일대", 33.09, 44.58, "s-parthia s-sasan"],
    ["인도 북서부·간다라", 34.01, 71.53, "s-kushan"],
    ["메카", 21.43, 39.83, "s-hijra"],
    ["메디나", 24.5, 39.58, "s-hijra s-rashidun"],
    ["다마스쿠스", 33.5, 36.3, "s-umayyad s-syria"],
    ["바그다드", 33.34, 44.39, "s-abbasid s-seljuk"],
    ["코르도바", 37.88, -4.77, "s-cordoba"],
    ["북아프리카 동부", 35.5, 11.06, "s-fatimid"],
    ["카이로", 30.05, 31.25, "s-egypt-mod"],
    ["가즈니", 33.55, 68.43, "s-ghazni"],
    ["타밀 지역", 10.79, 79.14, "s-chola"],
    ["아프가니스탄 중부·구르", 34.47, 64.91, "s-ghur"],
    ["델리", 28.67, 77.23, "s-delhi s-mughal s-sepoy s-partition"],
    ["아나톨리아 서북부", 40.02, 30.18, "s-ottoman"],
    ["사마르칸트", 39.67, 66.95, "s-timurid"],
    ["타브리즈", 38.09, 46.3, "s-safavid"],
    ["테헤란", 35.69, 51.42, "s-iran-nat s-iran-const"],
    ["콜카타", 22.57, 88.37, "s-brahmo s-india-nat"],
    ["뭄바이", 19.07, 72.88, "s-inc"],
    ["펀자브 일대", 31.63, 74.87, "s-india-nat2"],
    ["카라치", 24.87, 66.99, "s-partition"],
    ["나지드", 24.63, 46.72, "s-wahhabi"],
    ["에티오피아 북부·아도와", 14.16, 38.89, "s-africa-nat"],
    ["텔아비브", 32.08, 34.78, "s-israel"],
    ["이스라엘·팔레스타인 일대", 31.74, 35.16, "s-oslo"],
  ];

  // 기록의 상세 연표·요약과 다음 정권의 시작을 대조해 확인한 연도 범위.
  // 고조선의 시작은 정본에 적힌 전승상의 대표 연도를 따른다.
  const dossierPeriods = {
    "k-gojoseon": [-2333, -108],
    "k-silla": [-57, 935],
    "k-goguryeo": [-37, 668],
    "k-baekje": [-18, 660],
    "k-gaya": [42, 562],
    "k-goguryeo-tang": [645, 668],
    "k-unify": [676, 935],
    "k-balhae": [698, 926],
    "k-goryeo": [918, 1392],
    "k-joseon": [1392, 1897],
    "k-js-imjin": [1592, 1598],
    "k-js-jeongyu": [1597, 1598],
    "k-js-byeongja": [1636, 1637],
    "k-daewongun": [1863, 1873],
    "k-agwan": [1896, 1897],
    "k-land-survey": [1910, 1918],
    "k-provisional": [1919, 1945],
    "k-sanmi": [1920, 1934],
    "k-gwangju-student": [1929, 1930],
    "k-vnarod": [1931, 1935],
    "k-jeju43": [1947, 1954],
    "k-625": [1950, 1953],
    "k-gov-rhee": [1948, 1960],
    "k-gov-chang": [1960, 1961],
    "k-gov-park": [1963, 1979],
    "k-gov-choi": [1979, 1980],
    "k-gov-chun": [1980, 1988],
    "k-gov-roh": [1988, 1993],
    "k-gov-kys": [1993, 1998],
    "k-gov-kdj": [1998, 2003],
    "k-gov-rmh": [2003, 2008],
    "k-gov-lmb": [2008, 2013],
    "k-gov-pgh": [2013, 2017],
    "k-gov-moon": [2017, 2022],
    "k-gov-yoon": [2022, 2025],
    "e-jomon": [-8050, -300],
    "e-xia": [-2000, -1600],
    "e-shang": [-1600, -1046],
    "e-zhou": [-1046, -256],
    "e-qin": [-221, -206],
    "e-han-founded": [-202, 8],
    "e-wang": [8, 23],
    "e-later-han": [25, 220],
    "e-yayoi": [-300, 300],
    "e-3kingdoms": [220, 265],
    "e-jin": [265, 316],
    "e-wuhu": [304, 439],
    "e-beiwei": [386, 534],
    "e-dongjin": [317, 420],
    "e-sui": [581, 618],
    "e-tang": [618, 907],
    "e-liao": [916, 1125],
    "e-song": [960, 1127],
    "e-xixia": [1038, 1227],
    "e-jin-jurchen": [1115, 1234],
    "e-nansong": [1127, 1279],
    "e-yuan": [1271, 1368],
    "e-ming": [1368, 1644],
    "e-asuka": [538, 710],
    "e-nara": [710, 794],
    "e-heian": [794, 1185],
    "e-kamakura": [1192, 1336],
    "e-muromachi": [1336, 1573],
    "e-sengoku": [1467, 1590],
    "e-edo": [1603, 1868],
    "e-houjin": [1616, 1636],
    "e-qing": [1636, 1912],
    "e-nguyen": [1802, 1945],
    "e-taiping": [1851, 1864],
    "e-yangwu": [1861, 1895],
    "e-xinhai": [1911, 1912],
    "e-civilwar": [1946, 1949],
    "s-hittite": [-1650, -1200],
    "s-assyria": [-2000, -612],
    "s-persia": [-550, -330],
    "s-magadha": [-322, -185],
    "s-parthia": [-247, 224],
    "s-kushan": [50, 320],
    "s-sasan": [226, 651],
    "s-gupta": [320, 550],
    "s-rashidun": [632, 661],
    "s-umayyad": [661, 750],
    "s-abbasid": [750, 1258],
    "s-cordoba": [756, 1031],
    "s-fatimid": [909, 1171],
    "s-ghazni": [977, 1186],
    "s-chola": [870, 1279],
    "s-ghur": [1150, 1215],
    "s-delhi": [1206, 1526],
    // https://www.ktb.gov.tr/EN-103933/1922.html
    "s-ottoman": [1299, 1922],
    "s-timurid": [1369, 1507],
    // https://resources.metmuseum.org/resources/metpublications/pdf/Islamic_art_in_the_Metropolitan_Museum_the_historical_context.pdf
    "s-safavid": [1501, 1736],
    "s-mughal": [1526, 1858],
    "s-sepoy": [1857, 1859],
    "w-rome-found": [-753, 476],
    "w-rome-rep": [-509, -27],
    "w-greco-persian": [-492, -479],
    "w-peloponnesian": [-431, -404],
    "w-macedonia": [-650, -168],
    "w-alexander-empire": [-336, -323],
    "w-rome-emp": [-27, 476],
    "w-byzantine": [395, 1453],
    "w-frank": [481, 843],
    "w-crusade": [1096, 1270],
    "w-hundred": [1337, 1453],
    "w-roses": [1455, 1485],
    "w-french-rev": [1789, 1799],
    // https://palazzo.quirinale.it/luoghi/pdf/it/sala-regno-italia.pdf
    "w-italy": [1861, 1946],
    // https://www.bundestag.de/en/parliament/history/parliamentarism/empire/empire-200352
    "w-germany": [1871, 1918],
  };

  const trackViews = {
    korea: {lat: 37, lng: 127, altitude: 0.84},
    eastasia: {lat: 34, lng: 117, altitude: 1.6},
    west: {lat: 39, lng: -30, altitude: 2.6},
    westasia: {lat: 25, lng: 60, altitude: 1.8},
  };
  const pointPlaces = places.map(([label, lat, lng, ids], i) => ({
    id: "record-place-" + i, label, lat, lng, kind: "point", eventIds: ids.split(" "),
  }));
  const placesByRecord = new Map();
  for (const point of pointPlaces) {
    for (const id of point.eventIds) {
      if (!placesByRecord.has(id)) placesByRecord.set(id, []);
      placesByRecord.get(id).push(point);
    }
  }

  function validYear(year) {
    return Number.isInteger(year) && year !== 0;
  }

  function yearLabel(year) {
    if (!validYear(year)) return "연도 미지정";
    return Math.abs(year) + (year < 0 ? " BCE" : " CE");
  }

  function recordYear(event) {
    return validYear(event?.year) ? event.year : null;
  }

  function initialView({event, track, year} = {}) {
    const place = placesByRecord.get(event?.id)?.[0];
    const view = trackViews[track || event?.track] || {lat: 20, lng: 0, altitude: 2.8};
    const initialYear = recordYear(event) ?? (validYear(year) ? year : null);
    if (!place) return {...view, year: initialYear};
    return {
      lat: place.lat, lng: place.lng, altitude: 1,
      year: initialYear, placeLabel: place.label,
    };
  }

  function signedYear(digits, era) {
    return Number(digits) * (era === "BCE" ? -1 : 1);
  }

  // 닫힌 기간이나 개별 연도만 확장한다. '이후'·'무렵 ~'는 끝을 추정하지 않는다.
  function recordDates(event) {
    const label = event.yearLabel || "";
    const range = /^(\d+)(?:\s*(BCE|CE))?\s*[~–]\s*(\d+)(?:\s*(BCE|CE))?(?:\s*무렵)?$/.exec(label);
    if (range) {
      const first = signedYear(range[1], range[2] || range[4]);
      const last = signedYear(range[3], range[4] || range[2]);
      return {range: first <= last ? [first, last] : [last, first]};
    }
    const individual = /^(\d+)\s*·\s*(\d+)\s*(BCE|CE)?$/.exec(label);
    if (individual) return {years: [signedYear(individual[1], individual[3]), signedYear(individual[2], individual[3])]};
    const decades = /^(\d+)~(\d+)년대$/.exec(label);
    if (decades) return {range: [Number(decades[1]), Number(decades[2]) + 9]};
    const centuries = /^(\d+)(?:~(\d+))?세기\s*(BCE|CE)?\s*(경|무렵|전반|후반)?\s*(BCE|CE)?$/.exec(label);
    if (centuries) {
      const first = Number(centuries[1]);
      const last = Number(centuries[2] || centuries[1]);
      const min = Math.min(first, last);
      const max = Math.max(first, last);
      const bce = (centuries[3] || centuries[5]) === "BCE";
      let start = bce ? -100 * max : 100 * (min - 1) + 1;
      let end = bce ? -100 * (min - 1) - 1 : 100 * max;
      if (centuries[4] === "전반") end = Math.floor((start + end) / 2);
      if (centuries[4] === "후반") start = Math.floor((start + end) / 2) + 1;
      return {range: [start, end]};
    }
    return {years: [recordYear(event)]};
  }

  function dateBounds(event) {
    const year = recordYear(event);
    if (year === null) return null;
    const {years, range} = recordDates(event);
    const period = dossierPeriods[event.id] || range;
    if (period) return {start: period[0], end: period[1]};
    const dates = [...new Set(years.filter(validYear))].sort((a, b) => a - b);
    if (dates.length > 1) return {start: dates[0], end: dates[dates.length - 1], years: dates};
    return {start: year, end: year};
  }

  function browseableRecords(year, track) {
    if (!validYear(year)) return [];
    const database = global.TIMELINE_DB;
    return (global.TIMELINE_DATA?.events || []).filter(event => {
      if (event.noSync || !database?.[event.id] || !placesByRecord.has(event.id)) return false;
      if (track && event.track !== track) return false;
      // 노드를 연 대표 연도에는 원문 기록을 언제나 선택할 수 있다.
      if (recordYear(event) === year) return true;
      const {years, range} = recordDates(event);
      const period = dossierPeriods[event.id];
      if (period && year >= period[0] && year <= period[1]) return true;
      return range ? year >= range[0] && year <= range[1] : years.includes(year);
    });
  }

  function pointsForYear(year, track) {
    const ids = new Set(browseableRecords(year, track).map(event => event.id));
    return pointPlaces.flatMap(place => {
      const eventIds = place.eventIds.filter(id => ids.has(id));
      if (!eventIds.length) return [];
      return [{...place, eventIds, eventId: eventIds.length === 1 ? eventIds[0] : undefined}];
    });
  }

  function closeLongitude(lng, reference) {
    const difference = lng - reference;
    return reference + ((((difference + 180) % 360) + 360) % 360 - 180);
  }

  function ringContains(point, ring) {
    if (ring.length < 4) return false;
    // 이음선을 건너는 링도 연속된 경도에 옮긴 다음 비교한다.
    const x = closeLongitude(point.lng, ring[0][0]);
    const y = point.lat;
    let prevX = ring[0][0];
    let prevY = ring[0][1];
    let inside = false;
    for (let i = 1; i < ring.length; i++) {
      const [lng, lat] = ring[i];
      const nextX = closeLongitude(lng, prevX);
      if ((prevY > y) !== (lat > y) &&
          x < (nextX - prevX) * (y - prevY) / (lat - prevY) + prevX) {
        inside = !inside;
      }
      prevX = nextX;
      prevY = lat;
    }
    return inside;
  }

  function polygonContains(point, [outer, ...holes]) {
    return !!outer && ringContains(point, outer) && !holes.some(hole => ringContains(point, hole));
  }

  function contains(point, geometry) {
    if (geometry?.type === "Polygon") return polygonContains(point, geometry.coordinates);
    if (geometry?.type === "MultiPolygon") {
      return geometry.coordinates.some(poly => polygonContains(point, poly));
    }
    return false;
  }

  function placesForRecord(id) {
    return (placesByRecord.get(id) || []).map(({lat, lng, label}) => ({lat, lng, label}));
  }

  function recordsForRegion(region, year, track) {
    if (!region) return [];
    const records = browseableRecords(year, track);
    if (region.kind === "point" || region.eventIds || region.eventId) {
      const ids = new Set(region.eventIds || [region.eventId]);
      return records.filter(event => ids.has(event.id));
    }
    return records.filter(event => placesByRecord.get(event.id).some(place => contains(place, region.geometry)));
  }

  global.IBA_GLOBE_RECORDS = {
    initialView, pointsForYear, recordsForRegion, placesForRecord, recordYear, dateBounds, yearLabel, contains,
  };
})(window);
