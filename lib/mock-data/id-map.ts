// 설계서 05_ERD/02 — ORDER_REQUEST_ID ↔ SRM_BID_ID 매핑 테이블
// 실제 구현에서는 DB에서 관리. 프로토타입에서는 공유 참조용 상수로 관리.

export type IdMapEntry = {
  pmsCardId: string;       // PMS BidCard.id
  orderRequestId: string;  // ORDER_REQUEST.ORDER_REQUEST_ID (PMS → SRM 발주요청)
  srmBidId: string;        // SRM_BID.SRM_BID_ID (SRM 입찰 공고 ID)
  srmOrderId: string;      // SRM Order.id (SRM 발주계획 접수 ID)
};

export const PMS_SRM_ID_MAP: IdMapEntry[] = [
  // ── 발주요청접수 (SRM에서 발주계획 수립 중 — 아직 공고 없음)
  { pmsCardId: 'PL-009', orderRequestId: 'ORD-REQ-2025-009', srmBidId: '', srmOrderId: 'ORD-2026-009' },
  { pmsCardId: 'PL-010', orderRequestId: 'ORD-REQ-2025-010', srmBidId: '', srmOrderId: 'ORD-2026-010' },
  { pmsCardId: 'PL-005', orderRequestId: 'ORD-REQ-2025-005', srmBidId: '', srmOrderId: 'ORD-2026-008' },

  // ── 공고중 (SRM에서 srm-bid-stage: ANNOUNCED 발송 완료)
  { pmsCardId: 'PL-001', orderRequestId: 'ORD-REQ-2025-001', srmBidId: 'BID-2026-005', srmOrderId: 'ORD-2026-007' },
  { pmsCardId: 'PL-008', orderRequestId: 'ORD-REQ-2025-008', srmBidId: 'BID-2025-008', srmOrderId: 'ORD-2025-008' },

  // ── 제안서접수중 (srm-bid-stage: PROPOSAL_OPEN + srm-bid-items 수신 완료)
  { pmsCardId: 'PL-002', orderRequestId: 'ORD-REQ-2025-002', srmBidId: 'BID-2026-004', srmOrderId: 'ORD-2025-002' },
  { pmsCardId: 'PL-007', orderRequestId: 'ORD-REQ-2025-007', srmBidId: 'BID-2025-007', srmOrderId: 'ORD-2025-007' },

  // ── 기술평가 (srm-bid-stage: TECH_EVAL + srm-bid-proposals 수신 완료)
  { pmsCardId: 'PL-003', orderRequestId: 'ORD-REQ-2025-003', srmBidId: 'BID-2026-003', srmOrderId: 'ORD-2025-003' },
  { pmsCardId: 'PL-006', orderRequestId: 'ORD-REQ-2025-006', srmBidId: 'BID-2025-006', srmOrderId: 'ORD-2025-006' },

  // ── 가격평가 (srm-bid-stage: PRICE_EVAL)
  { pmsCardId: 'PL-011', orderRequestId: 'ORD-REQ-2025-011', srmBidId: 'BID-2026-002', srmOrderId: 'ORD-2025-011' },
  { pmsCardId: 'PL-012', orderRequestId: 'ORD-REQ-2025-012', srmBidId: 'BID-2025-012', srmOrderId: 'ORD-2025-012' },

  // ── 낙찰 (srm-bid-awarded 수신 완료)
  { pmsCardId: 'PL-004', orderRequestId: 'ORD-REQ-2025-004', srmBidId: 'BID-2026-001', srmOrderId: 'ORD-2025-004' },
  { pmsCardId: 'PL-013', orderRequestId: 'ORD-REQ-2025-013', srmBidId: 'BID-2025-013', srmOrderId: 'ORD-2025-013' },

  // ── 계약체결 (PMS 내부 계약 체결 완료)
  { pmsCardId: 'PL-014', orderRequestId: 'ORD-REQ-2025-014', srmBidId: 'BID-2025-014', srmOrderId: 'ORD-2025-014' },
];

export function findByPmsCardId(pmsCardId: string): IdMapEntry | undefined {
  return PMS_SRM_ID_MAP.find((e) => e.pmsCardId === pmsCardId);
}

export function findBySrmBidId(srmBidId: string): IdMapEntry | undefined {
  return PMS_SRM_ID_MAP.find((e) => e.srmBidId === srmBidId);
}
