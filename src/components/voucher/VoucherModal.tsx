'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Ticket, Sparkles, Check, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import {
  claimVoucher,
  selectCartVoucher,
  selectActiveUserVouchers,
  VOUCHER_CATALOG,
  VoucherCatalogItem,
  UserVoucher,
} from '@/store/slices/voucher.slice'
import { setUser } from '@/store/slices/session.slice'
import { deductPoints } from '@/lib/auth'

interface VoucherModalProps {
  isOpen: boolean
  onClose: () => void
  cartTotal?: number
  initialTab?: 'my-vouchers' | 'exchange'
}

export function VoucherModal({
  isOpen,
  onClose,
  cartTotal,
  initialTab = 'my-vouchers',
}: VoucherModalProps) {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.session.user)
  const activeVouchers = useAppSelector(selectActiveUserVouchers)
  const selectedVoucherId = useAppSelector((state) => state.voucher.selectedVoucherId)

  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'my-vouchers' | 'exchange'>(initialTab)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
      setSuccessMessage(null)
      setErrorMessage(null)
    }
  }, [isOpen, initialTab])

  if (!isOpen || !mounted) return null

  const userPoints = user?.points ?? 0

  const handleClaim = (item: VoucherCatalogItem) => {
    setErrorMessage(null)
    setSuccessMessage(null)

    if (userPoints < item.pointsCost) {
      setErrorMessage(`แต้มไม่เพียงพอ ต้องการ ${item.pointsCost} แต้ม`)
      return
    }

    try {
      if (user) {
        const updatedUser = deductPoints(user.id, item.pointsCost, user)
        dispatch(setUser(updatedUser))
      }
      dispatch(claimVoucher(item))
      setSuccessMessage(`แลก "${item.title}" สำเร็จแล้ว!`)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'แลกคูปองไม่สำเร็จ')
    }
  }

  const handleSelectVoucher = (voucher: UserVoucher) => {
    if (cartTotal !== undefined && cartTotal < voucher.minSpend) {
      return
    }

    if (selectedVoucherId === voucher.id) {
      dispatch(selectCartVoucher(null))
    } else {
      dispatch(selectCartVoucher(voucher.id))
      onClose()
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="voucher-modal-title"
        className="w-full max-w-[430px] max-h-[85vh] flex flex-col bg-[#F7F3E8] rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden animate-bottom-sheet pb-[max(1rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white px-5 pt-4 pb-3 border-b border-[#E9D7B5]/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-market-orange/15 text-market-orange flex items-center justify-center">
              <Ticket size={20} strokeWidth={2.4} />
            </div>
            <div>
              <h2 id="voucher-modal-title" className="font-bold text-[#2E2318] text-base leading-tight">
                คูปองและส่วนลด
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-[#8A7B6D]">แต้มของคุณ:</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-md">
                  <Sparkles size={11} className="fill-amber-500 text-amber-500" />
                  {userPoints.toLocaleString('th-TH')} แต้ม
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่างคูปอง"
            className="w-9 h-9 rounded-full bg-[#FAF7F0] hover:bg-[#F2ECE1] active:scale-95 text-[#6B5A4B] flex items-center justify-center transition-transform"
          >
            <X size={18} strokeWidth={2.4} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white px-5 pb-3 pt-1 border-b border-[#E9D7B5]/50 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('my-vouchers')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'my-vouchers'
              ? 'bg-market-brown text-white shadow-xs'
              : 'bg-[#FAF7F0] text-[#6B5A4B] hover:bg-[#F0EAE1]'
              }`}
          >
            <Ticket size={14} />
            คูปองของฉัน ({activeVouchers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('exchange')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'exchange'
              ? 'bg-market-orange text-white shadow-xs'
              : 'bg-[#FAF7F0] text-[#6B5A4B] hover:bg-[#F0EAE1]'
              }`}
          >
            <Sparkles size={14} />
            แลกคูปองด้วยแต้ม
          </button>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'my-vouchers' ? (
            /* My Vouchers Tab */
            activeVouchers.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="w-14 h-14 rounded-full bg-white border border-[#E9D7B5] mx-auto flex items-center justify-center text-[#B3A497] mb-3">
                  <Ticket size={28} strokeWidth={1.6} />
                </div>
                <p className="font-bold text-[#2E2318] text-sm">คุณยังไม่มีคูปองส่วนลด</p>
                <p className="text-xs text-[#8A7B6D] mt-1">
                  ใช้แต้มสะสมจากการสั่งอาหารแลกรับส่วนลดพิเศษได้เลย
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('exchange')}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-market-orange text-white font-bold text-xs shadow-xs hover:bg-[#E8894E] active:scale-95 transition-all"
                >
                  <Sparkles size={14} /> ไปแลกคูปอง
                </button>
              </div>
            ) : (
              activeVouchers.map((voucher) => {
                const isSelected = selectedVoucherId === voucher.id
                const isEligible = cartTotal === undefined || cartTotal >= voucher.minSpend
                const missingAmount =
                  cartTotal !== undefined && cartTotal < voucher.minSpend
                    ? voucher.minSpend - cartTotal
                    : 0

                return (
                  <div
                    key={voucher.id}
                    className={`relative rounded-2xl p-3.5 border transition-all ${isSelected
                      ? 'bg-amber-50/70 border-market-orange shadow-warm-xs'
                      : isEligible
                        ? 'bg-white border-[#E9D7B5]/70 hover:border-market-orange/40 shadow-2xs'
                        : 'bg-gray-50/80 border-gray-200 opacity-60'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3 min-w-0">
                        <div
                          className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${isSelected
                            ? 'bg-market-orange text-white'
                            : 'bg-[#FAF7F0] text-market-brown border border-[#E9D7B5]/60'
                            }`}
                        >
                          <span className="text-[10px] font-bold leading-none">ลด</span>
                          <span className="text-[16px] font-black leading-tight">
                            ฿{voucher.discountAmount}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <p className="font-bold text-[#2E2318] text-sm truncate">
                            {voucher.title}
                          </p>
                          <p className="text-[11px] text-[#8A7B6D] mt-0.5">
                            ขั้นต่ำ ฿{voucher.minSpend} · โค้ด: {voucher.code}
                          </p>
                          {!isEligible && (
                            <p className="text-[10px] text-rose-600 font-medium mt-1">
                              ซื้ออีก ฿{missingAmount} เพื่อใช้คูปองนี้
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Button if in cart mode */}
                      {cartTotal !== undefined ? (
                        <button
                          type="button"
                          onClick={() => handleSelectVoucher(voucher)}
                          disabled={!isEligible}
                          className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${isSelected
                            ? 'bg-market-orange text-white hover:bg-rose-600'
                            : isEligible
                              ? 'bg-market-brown text-white hover:bg-[#8C6540] active:scale-95'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                          {isSelected ? (
                            <span className="flex items-center gap-1">
                              <Check size={13} strokeWidth={3} /> ใช้แล้ว
                            </span>
                          ) : (
                            'เลือกใช้'
                          )}
                        </button>
                      ) : (
                        <span className="shrink-0 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.8 rounded-md">
                          พร้อมใช้งาน
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )
          ) : (
            /* Exchange Tab */
            <div className="space-y-3">
              <div className="bg-amber-50/80 rounded-2xl p-3 border border-amber-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-amber-900">
                    แลกได้ทันทีโดยใช้แต้มสะสม
                  </span>
                </div>
                <span className="text-xs font-bold text-amber-900">
                  {userPoints.toLocaleString('th-TH')} แต้ม
                </span>
              </div>

              {VOUCHER_CATALOG.map((item) => {
                const canAfford = userPoints >= item.pointsCost

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-3.5 border border-[#E9D7B5]/60 shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200/60 text-market-orange flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold leading-none">ลด</span>
                        <span className="text-[16px] font-black leading-tight">
                          ฿{item.discountAmount}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#2E2318] text-sm truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-[#8A7B6D] mt-0.5 truncate">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[11px] font-bold text-amber-700">
                            🪙 {item.pointsCost} แต้ม
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleClaim(item)}
                      disabled={!canAfford}
                      className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all ${canAfford
                        ? 'bg-market-orange text-white hover:bg-[#E8894E] active:scale-95 shadow-xs'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      {canAfford ? 'แลกคูปอง' : 'แต้มไม่พอ'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer if in cart mode */}
        {cartTotal !== undefined && selectedVoucherId && (
          <div className="bg-white px-5 py-3 border-t border-[#E9D7B5]/60 flex items-center justify-between">
            <span className="text-xs text-[#6B5A4B] font-medium">กำลังใช้คูปองส่วนลด</span>
            <button
              type="button"
              onClick={() => dispatch(selectCartVoucher(null))}
              className="text-xs text-rose-600 font-bold hover:underline"
            >
              ยกเลิกการใช้คูปอง
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

