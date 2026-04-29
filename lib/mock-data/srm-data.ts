// SRM 연계 데이터 — 설계서 FN-P-14 §4 Drawer 섹션 2·3·4 대응
// 실제 구현에서는 SRM Webhook(srm-bid-items, srm-bid-proposals, srm-bid-awarded)으로 수신

export type SrmItem = { name: string; unit: string; qty: number; unitPrice: number };

export type SrmBidItems = {
  announcement: string;
  items: SrmItem[];
  announceDate: string;
  deadline: string;
  webhookAt: string;
};

export type SrmProposal = {
  vendor: string;
  srmPartnerId: string;
  total: number;
  delivery: number;
  creditGrade: string;
  debtRatio: string;
  history: number;
};

export type SrmAward = {
  vendor: string;
  srmPartnerId: string;
  price: number;
  awardDate: string;
  confirmed: boolean;
};

// ── srm-bid-items Webhook 수신 데이터 (공고중 이상 카드) — 키: pmsCardId
export const SRM_BID_ITEMS: Record<string, SrmBidItems> = {
  'PL-001': {
    announcement: '광명공장 LED 조명교체 사업 경쟁입찰 공고. 대상: 광명공장 생산동·사무동 전체 조명 설비 300세트 교체.',
    items: [{ name: 'LED 조명교체', unit: '세트', qty: 300, unitPrice: 600000 }],
    announceDate: '2025-03-01', deadline: '2025-05-30', webhookAt: '2025-03-01 09:12:04',
  },
  'PL-008': {
    announcement: '세종시청 옥상 태양광 발전소 적격심사 공고. 대상: 시청 본관·별관 옥상 합산 180kW 태양광 시스템.',
    items: [
      { name: '태양광 패널 (180kW)', unit: '식', qty: 1, unitPrice: 720000000 },
      { name: '계통 연계 공사', unit: '식', qty: 1, unitPrice: 60000000 },
    ],
    announceDate: '2025-03-20', deadline: '2025-06-20', webhookAt: '2025-03-20 10:00:00',
  },
  'PL-002': {
    announcement: '인천물류센터 ESS 설치 제한경쟁 입찰 공고. 대상: 리튬이온 배터리 ESS 500kWh 1식 설치 및 시운전.',
    items: [
      { name: 'ESS 본체 (500kWh)', unit: '식', qty: 1, unitPrice: 280000000 },
      { name: 'BMS 제어시스템', unit: '식', qty: 1, unitPrice: 40000000 },
    ],
    announceDate: '2025-03-15', deadline: '2025-06-15', webhookAt: '2025-03-15 14:05:22',
  },
  'PL-007': {
    announcement: '포항제철 폐열회수 설비 경쟁입찰 공고. 대상: 고로 폐열 ORC 발전 시스템 2,400kW급 1식 설계·공급·시운전.',
    items: [
      { name: 'ORC 발전 모듈 (1,200kW)', unit: '식', qty: 2, unitPrice: 1100000000 },
      { name: '열교환기 시스템', unit: '식', qty: 1, unitPrice: 150000000 },
      { name: '전기 공사 및 계통 연계', unit: '식', qty: 1, unitPrice: 50000000 },
    ],
    announceDate: '2025-04-15', deadline: '2025-07-10', webhookAt: '2025-04-15 09:00:00',
  },
  'PL-003': {
    announcement: '대전공장 HVAC 최적화 경쟁입찰 공고. 대상: 냉각탑 2대·AHU 3대 교체 및 인버터 제어 최적화.',
    items: [
      { name: '냉각탑 교체', unit: '대', qty: 2, unitPrice: 45000000 },
      { name: 'AHU 교체', unit: '대', qty: 3, unitPrice: 30000000 },
      { name: '인버터 제어반', unit: '식', qty: 1, unitPrice: 25000000 },
    ],
    announceDate: '2025-02-20', deadline: '2025-05-20', webhookAt: '2025-04-18 10:32:14',
  },
  'PL-006': {
    announcement: '창원공장 인버터 교체 제한경쟁 공고. 대상: 생산라인 모터 인버터 32대 교체 및 에너지 모니터링 시스템 구축.',
    items: [
      { name: '산업용 인버터 (75kW)', unit: '대', qty: 20, unitPrice: 8500000 },
      { name: '산업용 인버터 (45kW)', unit: '대', qty: 12, unitPrice: 5500000 },
      { name: 'EMS 소프트웨어', unit: '식', qty: 1, unitPrice: 40000000 },
    ],
    announceDate: '2025-03-10', deadline: '2025-06-01', webhookAt: '2025-04-25 11:20:05',
  },
  'PL-011': {
    announcement: '여수산단 압축공기 최적화 경쟁입찰 공고. 대상: 컴프레서 3대 인버터화 및 에어 모니터링 시스템 구축.',
    items: [
      { name: '인버터 컴프레서 (22kW)', unit: '대', qty: 3, unitPrice: 85000000 },
      { name: '공기압 모니터링 시스템', unit: '식', qty: 1, unitPrice: 25000000 },
      { name: '배관 개선 공사', unit: '식', qty: 1, unitPrice: 25000000 },
    ],
    announceDate: '2025-03-05', deadline: '2025-05-10', webhookAt: '2025-04-28 14:15:40',
  },
  'PL-012': {
    announcement: '안산공단 공조 에너지 절감 경쟁입찰 공고. 대상: 멀티형 에어컨 시스템 교체 및 스마트 제어 도입.',
    items: [
      { name: '멀티형 에어컨 (10HP)', unit: '대', qty: 8, unitPrice: 12000000 },
      { name: '스마트 제어 시스템', unit: '식', qty: 1, unitPrice: 19000000 },
    ],
    announceDate: '2025-03-25', deadline: '2025-05-25', webhookAt: '2025-04-22 09:44:11',
  },
  'PL-004': {
    announcement: '수원사업장 옥상 태양광 설치 2단계 입찰 공고. 대상: 250kW급 태양광 발전 시스템 설계·공급·설치.',
    items: [
      { name: '태양광 패널 (250kW)', unit: '식', qty: 1, unitPrice: 380000000 },
      { name: '인버터 및 전력 변환 장치', unit: '식', qty: 1, unitPrice: 80000000 },
      { name: '구조물·배선 공사', unit: '식', qty: 1, unitPrice: 40000000 },
    ],
    announceDate: '2025-04-01', deadline: '2025-07-01', webhookAt: '2025-05-20 16:48:33',
  },
  'PL-013': {
    announcement: '엘엠에이티(LMAT) LED 조명 교체 제한경쟁 공고. 대상: LED 조명 시스템 교체 및 에너지 절감 최적화.',
    items: [
      { name: '고효율 LED 조명 (산업용)', unit: '식', qty: 2, unitPrice: 820000000 },
      { name: 'LED 제어 시스템', unit: '식', qty: 1, unitPrice: 120000000 },
      { name: '배선·전기 공사', unit: '식', qty: 1, unitPrice: 90000000 },
    ],
    announceDate: '2025-02-10', deadline: '2025-06-30', webhookAt: '2025-05-22 17:03:27',
  },
  'PL-014': {
    announcement: '롯데마트 냉동설비 절감 수의계약. 대상: 냉동 쇼케이스 인버터 제어 및 폐열 회수 시스템.',
    items: [
      { name: '인버터 냉동 제어 시스템', unit: '식', qty: 1, unitPrice: 380000000 },
      { name: '폐열 회수 유닛', unit: '식', qty: 1, unitPrice: 140000000 },
    ],
    announceDate: '2025-01-10', deadline: '2025-04-15', webhookAt: '2025-04-10 13:22:55',
  },
};

// ── srm-bid-proposals Webhook 수신 데이터 (기술평가 이상 카드) — 키: pmsCardId
export const SRM_PROPOSALS: Record<string, SrmProposal[]> = {
  'PL-003': [
    { vendor: '(주)한빛전기',     srmPartnerId: 'SRM-V-011', total: 222000000, delivery: 90,  creditGrade: 'A-',  debtRatio: '68%',  history: 2 },
    { vendor: '에너지솔루션(주)', srmPartnerId: 'SRM-V-002', total: 205000000, delivery: 80,  creditGrade: 'BB+', debtRatio: '85%',  history: 3 },
    { vendor: '(주)그린테크',     srmPartnerId: 'SRM-V-003', total: 238000000, delivery: 100, creditGrade: 'A',   debtRatio: '55%',  history: 1 },
  ],
  'PL-006': [
    { vendor: '창원전력(주)',      srmPartnerId: 'SRM-V-014', total: 416000000, delivery: 75,  creditGrade: 'BBB', debtRatio: '72%',  history: 0 },
    { vendor: '(주)한빛전기',     srmPartnerId: 'SRM-V-011', total: 428000000, delivery: 60,  creditGrade: 'A-',  debtRatio: '68%',  history: 4 },
    { vendor: '스마트이에스(주)', srmPartnerId: 'SRM-V-005', total: 398000000, delivery: 85,  creditGrade: 'BB',  debtRatio: '91%',  history: 1 },
  ],
  'PL-011': [
    { vendor: '에너지솔루션(주)', srmPartnerId: 'SRM-V-002', total: 352000000, delivery: 70,  creditGrade: 'BB+', debtRatio: '85%',  history: 3 },
    { vendor: '(주)대한컴프레서', srmPartnerId: 'SRM-V-021', total: 345000000, delivery: 65,  creditGrade: 'BBB', debtRatio: '60%',  history: 2 },
  ],
  'PL-012': [
    { vendor: '(주)한빛전기',     srmPartnerId: 'SRM-V-011', total: 190000000, delivery: 50,  creditGrade: 'A-',  debtRatio: '68%',  history: 2 },
    { vendor: '(주)그린테크',     srmPartnerId: 'SRM-V-003', total: 185000000, delivery: 60,  creditGrade: 'A',   debtRatio: '55%',  history: 3 },
    { vendor: '에너지솔루션(주)', srmPartnerId: 'SRM-V-002', total: 198000000, delivery: 45,  creditGrade: 'BB+', debtRatio: '85%',  history: 1 },
  ],
  'PL-004': [
    { vendor: '스마트이에스(주)', srmPartnerId: 'SRM-V-005', total: 480000000, delivery: 120, creditGrade: 'BB',  debtRatio: '91%',  history: 1 },
    { vendor: '(주)솔라파워',     srmPartnerId: 'SRM-V-022', total: 510000000, delivery: 110, creditGrade: 'A-',  debtRatio: '62%',  history: 0 },
  ],
  'PL-013': [
    { vendor: '(주)그린테크',     srmPartnerId: 'SRM-V-003', total: 1790000000, delivery: 150, creditGrade: 'A',   debtRatio: '55%',  history: 1 },
    { vendor: '에너지솔루션(주)', srmPartnerId: 'SRM-V-002', total: 1850000000, delivery: 140, creditGrade: 'BB+', debtRatio: '85%',  history: 2 },
    { vendor: '쿨링테크(주)',      srmPartnerId: 'SRM-V-031', total: 1820000000, delivery: 160, creditGrade: 'BBB', debtRatio: '70%',  history: 0 },
  ],
  'PL-014': [
    { vendor: '에너지솔루션(주)', srmPartnerId: 'SRM-V-002', total: 510000000, delivery: 90,  creditGrade: 'BB+', debtRatio: '85%',  history: 3 },
  ],
};

// ── srm-bid-awarded Webhook 수신 데이터 (낙찰 이상 카드) — 키: pmsCardId
export const SRM_AWARDS: Record<string, SrmAward> = {
  'PL-004': { vendor: '스마트이에스(주)', srmPartnerId: 'SRM-V-005', price: 480000000,  awardDate: '2025-05-28', confirmed: true  },
  'PL-013': { vendor: '(주)그린테크',    srmPartnerId: 'SRM-V-003', price: 1790000000, awardDate: '2025-05-22', confirmed: false },
  'PL-014': { vendor: '에너지솔루션(주)', srmPartnerId: 'SRM-V-002', price: 510000000,  awardDate: '2025-04-10', confirmed: true  },
};
