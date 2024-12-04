"use client"
import { DataCharts } from "@/components/data-charts";
import { Button } from "@/components/ui/button"
import {DataGrid} from "@/components/data-grid";
import { useNewAccount } from "@/features/accounts/hooks/use-new-account";

export default function Home(){
  const {onOpen} = useNewAccount();
  return (
    <div>
      <Button onClick={onOpen}>New Account</Button>
      <DataGrid/>
      <DataCharts/>
    </div>
  )
}