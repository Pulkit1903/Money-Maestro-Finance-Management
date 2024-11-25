import { useOpenCategory } from "@/features/categories/hooks/use-open-category"; 
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
type Props = {
    id: string;
    category: string | null;
    categoryId: string | null;
}
export const CategoryColumn = ({
    id,
    category,
    categoryId
}: Props) => {
    const {onOpen : onOpenCategory} = useOpenCategory();
    const onClick =() =>{
        if (categoryId) {
            onOpenCategory(categoryId);
        }
    }
    return (
        <div
        className={"flex items-center cursor-pointer hover:underline"}
        >
            {!category && <AlertTriangle className="mr-2 size-4 shrink-0"/>}
            {category || "Uncategorized"}
        </div>
    )
}