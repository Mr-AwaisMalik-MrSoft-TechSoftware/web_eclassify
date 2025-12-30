import { createSelector, createSlice } from "@reduxjs/toolkit";

const initialState = {
  cateData: [],
  catLastPage: 1,
  catCurrentPage: 1,
  isLoading: false,
  isLoadMore: false,
};

export const categorySlice = createSlice({
  name: "Category",
  initialState,
  reducers: {
    setCateData: (state, action) => {
      state.cateData = action.payload;
    },
    setCatLastPage: (state, action) => {
      state.catLastPage = action.payload;
    },
    setCatCurrentPage: (state, action) => {
      state.catCurrentPage = action.payload;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setIsLoadMore: (state, action) => {
      state.isLoadMore = action.payload;
    },
  },
});

export default categorySlice.reducer;
export const {
  setCateData,
  setCatLastPage,
  setCatCurrentPage,
  setIsLoading,
  setIsLoadMore,
} = categorySlice.actions;

export const CategoryData = createSelector(
  (state) => state.Category,
  (Category) => Category.cateData
);
export const LastPage = createSelector(
  (state) => state.Category,
  (Category) => Category.catLastPage
);
export const CurrentPage = createSelector(
  (state) => state.Category,
  (Category) => Category.catCurrentPage
);
export const IsLoading = createSelector(
  (state) => state.Category,
  (Category) => Category.isLoading
);
export const IsLoadMore = createSelector(
  (state) => state.Category,
  (Category) => Category.isLoadMore
);
