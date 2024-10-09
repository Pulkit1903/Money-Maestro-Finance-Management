import { Header } from "@/components/ui/header";

type Props = {
    children: React.ReactNode;
}
const DashboardLayout = ({children}: Props) => {
    return (
        <>
            <Header />
            <main className="px-5 lg:px-15">
            {children}
            </main>
        </>
    );
    }
    export default DashboardLayout;