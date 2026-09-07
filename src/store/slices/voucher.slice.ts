import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";

const VOUCHER_STORAGE_KEY = "ladrimchon_user_vouchers_v1";

export interface VoucherCatalogItem {
  id: string;
  code: string;
  title: string;
  description: string;
  pointsCost: number;
  discountAmount: number;
  minSpend: number;
}

export interface UserVoucher {
  id: string; // Unique instance ID
  voucherId: string;
  code: string;
  title: string;
  discountAmount: number;
  minSpend: number;
  claimedAt: string;
  usedAt?: string;
}

export const VOUCHER_CATALOG: VoucherCatalogItem[] = [
  {
    id: "v-5",
    code: "RIMCHON5",
    title: "ส่วนลด ฿5",
    description: "ลด 5 บาท เมื่อสั่งอาหารครบ 40 บาท",
    pointsCost: 30,
    discountAmount: 5,
    minSpend: 40,
  },
  {
    id: "v-10",
    code: "RIMCHON10",
    title: "ส่วนลด ฿10",
    description: "ลด 10 บาท เมื่อสั่งอาหารครบ 60 บาท",
    pointsCost: 50,
    discountAmount: 10,
    minSpend: 60,
  },
  {
    id: "v-25",
    code: "RIMCHON25",
    title: "ส่วนลดพิเศษ ฿25",
    description: "ลด 25 บาท เมื่อสั่งอาหารครบ 120 บาท",
    pointsCost: 100,
    discountAmount: 25,
    minSpend: 120,
  },
];

interface VoucherState {
  myVouchers: UserVoucher[];
  selectedVoucherId: string | null;
}

const loadInitialVouchers = (): UserVoucher[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(VOUCHER_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    // Ignore storage parse errors
  }
  return [];
};

const saveToStorage = (vouchers: UserVoucher[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VOUCHER_STORAGE_KEY, JSON.stringify(vouchers));
  } catch {
    // Ignore storage write errors
  }
};

const initialState: VoucherState = {
  myVouchers: loadInitialVouchers(),
  selectedVoucherId: null,
};

export const voucherSlice = createSlice({
  name: "voucher",
  initialState,
  reducers: {
    claimVoucher: (state, action: PayloadAction<VoucherCatalogItem>) => {
      const catalogItem = action.payload;
      const newVoucher: UserVoucher = {
        id: `uv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        voucherId: catalogItem.id,
        code: catalogItem.code,
        title: catalogItem.title,
        discountAmount: catalogItem.discountAmount,
        minSpend: catalogItem.minSpend,
        claimedAt: new Date().toISOString(),
      };
      state.myVouchers.unshift(newVoucher);
      saveToStorage(state.myVouchers);
    },
    selectCartVoucher: (state, action: PayloadAction<string | null>) => {
      state.selectedVoucherId = action.payload;
    },
    useVoucher: (state, action: PayloadAction<string>) => {
      const userVoucher = state.myVouchers.find((v) => v.id === action.payload);
      if (userVoucher) {
        userVoucher.usedAt = new Date().toISOString();
        saveToStorage(state.myVouchers);
      }
      if (state.selectedVoucherId === action.payload) {
        state.selectedVoucherId = null;
      }
    },
    syncVouchersFromStorage: (state) => {
      state.myVouchers = loadInitialVouchers();
    },
  },
});

export const {
  claimVoucher,
  selectCartVoucher,
  useVoucher,
  syncVouchersFromStorage,
} = voucherSlice.actions;

export const selectMyVouchers = (state: { voucher: VoucherState }) =>
  state.voucher.myVouchers;

export const selectSelectedVoucherId = (state: { voucher: VoucherState }) =>
  state.voucher.selectedVoucherId;

export const selectActiveUserVouchers = createSelector(
  [selectMyVouchers],
  (myVouchers) => myVouchers.filter((v) => !v.usedAt),
);

export const selectSelectedVoucher = createSelector(
  [selectMyVouchers, selectSelectedVoucherId],
  (myVouchers, selectedId) => {
    if (!selectedId) return null;
    return myVouchers.find((v) => v.id === selectedId && !v.usedAt) || null;
  },
);

export default voucherSlice.reducer;
