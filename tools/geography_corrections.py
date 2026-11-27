"""History of Nations 감사본(2026-11-21~24)에 따른 지구본 역사 국경 교정.

교과서 표기를 적용한 정치체(names-ko.js 교과서 통일 커밋 ec55370 · e14b7ff의 118종)와
globe.js의 historicalNamePeriods는 건드리지 않는다. 원자료의 정치체 이름(name)은 유지한다.

CLIPS    인용 문헌이 모두 존속하지 않았다고 보는 해에만 표시를 지운다. 값은 남길 [시작, 끝]이고
         None은 그쪽 끝을 원자료대로 둔다. 자료마다 연대가 다르면 가장 넓은 범위를 남긴다.
RELABELS 같은 영역에서 국호·지위가 바뀐 해에 표시명(labelKo)만 바꾼다. [시작, 끝, 표시명]
GEOMETRY 지구본 전수 검사(2026-11-27, docs/handoff/timeline-map-audit-2026-11-27.md)에서 사용자가 승인한
         도형 교정. tools/make_geography_geometry.py가 미리 계산한 geography_geometry.json.gz를 읽는다.
         replace는 해당 이름·연도의 도형을 바꾸고(None이면 그 해 표시를 지운다), add는 도형을 새로 넣는다.
         한국사 교과서 서술(고구려 중심지, 초기 백제·신라, 대가야, 원 간섭기 고려, 왜란·호란 시기 조선),
         원·명 개창 연도, 원자료 오류 조각 제거만 다룬다. 그 밖에 표시가 빠진 해는 채우지 않는다.
"""

import gzip
import json
import os
from pathlib import Path

GEOMETRY_FILE = Path(__file__).resolve().parent / 'geography_geometry.json.gz'
# 도형 교정을 다시 계산할 때는 IBA_NO_GEOMETRY=1로 교정 전 도형을 먼저 만든다 (make_geography_geometry.py 참조).
GEOMETRY = ({'replace': [], 'add': []} if os.environ.get('IBA_NO_GEOMETRY') or not GEOMETRY_FILE.exists()
            else json.loads(gzip.decompress(GEOMETRY_FILE.read_bytes())))

CLIPS = {
    # 한국·중국·동아시아
    'Goguryeo': (None, 668), 'Gojoseon': (None, -108), 'Northern Song': (None, 1127),
    'Later Zhao': (None, 351), 'Former Liang': (None, 376), 'Later Liang': (None, 403),
    'Former Zhao': (None, 329), 'Western Qin': (None, 431), 'Xia': (None, 431),
    'Northern Liang': (None, 439), 'Min': (None, 945), 'Southern Han': (None, 971),
    'Wuyue': (None, 978), 'Jingnan': (None, 963), 'Yan Kingdom': (None, 914),
    'Uyghur Khaganate': (None, 840), 'Kingdom of Dali': (None, 1253), 'Eastern Göktürks': (None, 630),
    '(Warring States China)': (None, -221), 'Chen': (None, -478), 'Xu': (None, -512), 'Zheng': (None, -375),
    'Gao Kaidao': (None, 624), '(Eighteen Kingdoms)': (-206, None), 'Western Chu': (-206, None),
    'Dai': (-206, None), 'Jibei': (-206, None), 'Zhai': (-206, None), 'Henan': (None, -205),
    'Jiaodong': (None, -206), 'Kenmu Restoration': (None, 1336), 'Trưng sisters': (None, 43),
    'Kingdom of Pinya': (None, 1365), 'Byeonhan': (None, 562), 'Sagaing Kingdom': (None, 1365), 'Prome Kingdom': (None, 1542),
    # 서아시아·인도·북아프리카
    'Abbasid Caliphate': (None, 1258), '(Delhi Sultanate)': (None, 1525), 'Tulunids': (None, 905),
    'Rustamid dynasty': (None, 909), 'Caliphate of Córdoba': (None, 1031), 'Marinid Sultanate': (None, 1465),
    'Wattasid dynasty': (1472, 1554), 'Saadi Sultanate': (None, 1659), 'Zengid dynasty': (None, 1251),
    'Sultanate of Rum': (None, 1307), 'Zand Dynasty': (1751, None), 'Danishmendids': (None, 1178),
    'Beylik of Teke': (None, 1423), 'Zurayid dynasty': (None, 1175), 'Rasulid Dynasty': (None, 1454),
    'Najahid Dynasty': (None, 1159), 'Injuids': (None, 1357), 'Muzaffarids': (None, 1393),
    'Sarbadars': (None, 1386), 'Sajid Dynasty': (None, 929), 'Hamdanid Emirates': (None, 1004),
    'Zayyanid dynasty': (None, 1550), 'Emirate of Jabal Shammar': (1835, None), 'Golden Horde': (None, 1502),
    'Astrakhan Khanate': (None, 1556), 'Khanate of Kokand': (1710, None), 'Ziyadid dynasty': (None, 1017),
    'Mahdids': (None, 1174), 'Beylik of Sinop': (None, 1322), 'Emirate of Nejd': (None, 1891),
    'Hoysala Kingdom': (None, 1346), 'Gurjara-Pratihara Dynasty': (None, 1027), 'Ahmadnagar Sultanate': (None, 1636),
    'Berar Sultanate': (None, 1574), 'Nanda Empire': (None, -321), 'Kingdom of Jerusalem': (None, 1291),
    'Lydia': (None, -546), 'Taifa of Granada': (None, 1090), 'Arab Federation': (None, 1958),
    'Kingdom of Cyprus': (None, 1489), 'Regency of Algiers': (None, 1829), 'Kampili Kingdom': (None, 1327),
    'Portuguese Ceylon': (None, 1658),
    # 고대 지중해·이집트
    'Ptolemaic Kingdom': (-323, -30), 'Antigonid Macedonia': (None, -168),
    'Twenty-sixth Dynasty of Egypt': (None, -525), 'Thirtieth Dynasty of Egypt': (-380, -343),
    'New Kingdom of Egypt': (None, -1069), 'Roman Kingdom': (None, -509), 'Kingdom of Bithynia': (None, -74),
    'Ostrogothic Kingdom': (None, 554), 'Kingdom of the Suebi': (None, 585), 'Kingdom of Soissons': (None, 486),
    'Kingdom of Thuringia': (None, 531),
    # 유럽
    'Latin Empire': (None, 1261), 'German Confederation': (None, 1866), 'Septinsular Republic': (None, 1807),
    'Confederation of the Rhine': (None, 1813), 'Denmark-Norway': (None, 1814), 'Norway-Denmark': (None, 1047),
    'Sloboda Ukraine': (None, 1765), 'Novgorod Republic': (None, 1478), 'Commonwealth of England': (1649, 1660),
    'Kingdom of Mann': (None, 1266), 'Livonian Conference': (None, 1561), 'Principality of Valona and Kanina': (None, 1417),
    'Pskov Republic': (None, 1510), 'Republic of Baden': (None, 1849), 'Serbian Empire': (None, 1371),
    'Serbian Despots': (1402, None), 'Tver': (None, 1485), 'House of Hohenstaufen': (None, 1268),
    'Kingdom of Aragon': (1035, None), 'Halych-Volhynia occupation': (1199, None), 'Nizhny Novgorod': (1341, 1392),
    'French Fourth Republic': (1946, None), '(French Fourth Republic)': (1946, None),
    # 아메리카·아프리카·기타
    'New Netherland': (None, 1664), 'New France': (None, 1763), 'Gran Colombia': (None, 1830),
    'Netherlands Antilles': (None, 2010), 'Belgian Congo': (None, 1959), 'Sultanate of Zanzibar': (None, 1964),
    'Tangier International Zone': (None, 1956), 'Maynila': (None, 1571),
}

RELABELS = {
    # 한국·중국·베트남: 같은 영역의 후계 왕조
    'Taebong': [(918, 921, '고려')],
    'Goryeo': [(1392, 1394, '조선')],
    'Joseon': [(1897, 1897, '대한 제국')],
    # 2026-11-27 전수 검사: 변한 지역의 가야(기원후 42년 건국 ~ 562년 대가야 멸망)
    'Byeonhan': [(42, 562, '가야')],
    'Northern Song': [(1127, 1127, '남송(南宋)')],
    'Kenmu Restoration': [(1336, 1336, '무로마치(室町) 막부')],
    'Tây Sơn dynasty': [(1802, 1802, '응우옌 왕조')],
    # 원자료 'Kuomintang'은 베이징 정부 시기의 중국 전역을 덮는다. 국가 표시는 중화민국.
    'Kuomintang': [(1917, 1929, '중화민국(中華民國)')],
    'Later Liang Dynasty': [(924, 925, '후당')],
    'Former Jin': [(922, 922, '진(晉)'), (923, 925, '후당')],
    'Later Jin': [(911, 921, '진(晉)')],
    'Later Han': [(951, 959, '후주')],
    'Later Zhou': [(-750, -257, '동주(東周)'), (960, 960, '북송')],
    'Song': [(-750, -285, '송(宋)')],
    'Southern Wu': [(911, 937, '오(양오)'), (938, 959, '남당')],
    'Cao Cao': [(220, 223, '위(魏)')],
    'Ngô Dynasty': [(969, 980, '딘 왕조'), (981, 1009, '전 레 왕조'), (1010, 1225, '리 왕조'),
                    (1226, 1400, '쩐 왕조'), (1401, 1406, '호 왕조')],
    # 인도·이슬람권
    'Mamluk Dynasty': [(1291, 1293, '할지 왕조')],
    'Khalji Dynasty': [(1321, 1325, '투글루크 왕조')],
    'Sayyid Dynasty': [(1452, 1452, '로디 왕조')],
    'Lodi Dynasty': [(1526, 1528, '무굴 제국')],
    'Nanda Empire': [(-322, -321, '마우리아 왕조')],
    'Aq Qoyunlu': [(1501, 1501, '사파비 왕조')],
    'Fatimid Caliphate': [(1172, 1176, '아이유브 왕조')],
    'Aghlabid Dynasty': [(909, 910, '파티마 왕조')],
    'Ottoman Empire': [(1923, 1923, '튀르키예 공화국')],
    # 유럽
    'Nicaean Empire': [(1262, 1278, '동로마 제국(비잔티움 제국)')],
    'Kingdom of Castile': [(1231, 1235, '카스티야 연합왕국')],
    'County of Savoy': [(1416, 1539, '사보이아 공국')],
    'County of Brabant': [(1260, 1430, '브라반트 공국')],
    'County of Béarn': [(1385, 1452, '베아른 자작령')],
    'Duchy of Mecklenburg': [(1815, 1870, '메클렌부르크 대공국')],
    'Duchy of Oldenburg': [(1815, 1870, '올덴부르크 대공국')],
    'Grand Duchy of Saxe-Weimar-Eisenach': [(1806, 1814, '작센바이마르아이제나흐 공국')],
    'Helvetic Republic': [(1804, 1814, '스위스')],
    'German Empire': [(1919, 1919, '바이마르 공화국')],
    'Kingdom of Great Britain': [(1801, 1921, '그레이트브리튼 아일랜드 연합 왕국'), (1922, 2024, '영국')],
    'Hungarian Republic': [(1920, 1943, '헝가리 왕국')],
    'Kingdom of Lithuania': [(1919, 1939, '리투아니아 공화국')],
    'United Principalities of Moldavia and Wallachia': [(1862, 1880, '루마니아 공국'), (1881, 1916, '루마니아 왕국')],
    'Socialist Republic of Romania': [(1948, 1964, '루마니아 인민 공화국')],
    "People's Socialist Republic of Albania": [(1946, 1975, '알바니아 인민 공화국')],
    'Republic of Poland': [(1953, 1989, '폴란드 인민 공화국')],
    'Former Yugoslav Republic of Macedonia': [(1992, 2018, '마케도니아 공화국')],
    'Republics of the Soviet Union': [(1920, 1921, '소비에트 공화국들')],
    'Estado Novo': [(1926, 1932, '포르투갈 군사 독재 정권'), (1975, 1975, '포르투갈'), (1979, 2024, '카빈다')],
    # 아프리카·아시아·아메리카
    'British Gold Coast': [(1957, 1960, '가나')],
    'Mali Federation': [(1961, 2024, '말리')],
    'Zimbabwe Rhodesia': [(1980, 1982, '짐바브웨')],
    'New Hebrides': [(1981, 1982, '바누아투')],
    'Natalia Republic': [(1844, 1910, '영국령 나탈')],
    "People's Republic of Zanzibar": [(1856, 1889, '잔지바르 술탄국')],
    'United Arab Republic': [(1972, 1972, '이집트')],
    'Libyan Arab Republic': [(1977, 2011, '리비아 아랍 자마히리야')],
    "People's Republic of Kampuchea": [(1994, 1995, '캄보디아')],
    'Argentine Confederation': [(1862, 1929, '아르헨티나')],
    'Anti-Kuomintang Coalition': [(1930, 1931, '반장제스 연합')],
    'Kamerun': [(1868, 1870, '카메룬 해안 지역')],
}


def _geometry_pieces(name, pieces, orig):
    """GEOMETRY['replace']를 연도 조각에 적용한다. pieces: [(시작, 끝, 표시명, 도형)]"""
    for entry in GEOMETRY['replace']:
        if entry['name'] != name or entry['within'][1] < orig[0] or entry['within'][0] > orig[1]:
            continue
        a, b = entry['start'], entry['end']
        split = []
        for s, e, label, geometry in pieces:
            if e < a or s > b:
                split.append((s, e, label, geometry))
                continue
            if s < a:
                split.append((s, a - 1, label, geometry))
            split.append((max(s, a), min(e, b), label, entry['geometry']))
            if e > b:
                split.append((b + 1, e, label, geometry))
        pieces = split
    return pieces


def apply(features):
    """Feature 목록을 받아 교정한 새 목록을 돌려준다. 같은 입력에 여러 번 적용해도 결과가 같다."""
    out = []
    for feature in features:
        props = feature['properties']
        name, start, end = props['name'], props['start'], props['end']
        if name in CLIPS:
            low, high = CLIPS[name]
            if low is not None:
                start = max(start, low)
            if high is not None:
                end = min(end, high)
            if start > end:
                continue
        pieces = [(start, end, props.get('labelKo'))]
        for a, b, label in RELABELS.get(name, []):
            split = []
            for s, e, current in pieces:
                if e < a or s > b or current is not None:
                    split.append((s, e, current))
                    continue
                if s < a:
                    split.append((s, a - 1, None))
                split.append((max(s, a), min(e, b), label))
                if e > b:
                    split.append((b + 1, e, None))
            pieces = split
        pieces = _geometry_pieces(name, [(s, e, l, feature['geometry']) for s, e, l in pieces], (start, end))
        for s, e, label, geometry in pieces:
            if geometry is None:
                continue
            new = dict(props, start=s, end=e, id=f'{name}:{s}:{e}')
            new.pop('labelKo', None)
            if label:
                new['labelKo'] = label
            out.append({**feature, 'properties': new, 'geometry': geometry})
    ids = {row['properties']['id'] for row in out}
    for row in GEOMETRY['add']:
        if row['properties']['id'] not in ids:
            out.append(row)
    return out
