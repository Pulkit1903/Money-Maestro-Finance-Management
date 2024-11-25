"use client";

import {NewAccountSheet} from "@/features/accounts/components/new-account-sheet";
import { useMountedState } from "react-use";

import EditAccountSheet from "../features/accounts/components/edit-accounts-sheet";
import NewCategorySheet from "@/features/categories/components/new-category-sheet";
import EditCategorySheet from "@/features/categories/components/edit-category-sheet ";

import {NewTransactionSheet} from "@/features/transactions/components/new-transaction-sheet";

const SheetProvider = () => {
  const isMounted = useMountedState();

  if (!isMounted) return null;

  return (
    <>
      <NewAccountSheet />
      <EditAccountSheet />
      <NewCategorySheet/>
      <EditCategorySheet/>

      <NewTransactionSheet/>
    </>
  );
};

export default SheetProvider;
