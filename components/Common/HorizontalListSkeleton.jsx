import { useId } from "react";
import ProductHorizontalCardSkeleton from "./ProductHorizontalCardSkeleton";

const HorizontalListSkeleton = () => {
    return (
        <div className="mt-8 flex flex-col gap-4">
            {Array.from({ length: 6 }).map(() => (
                <ProductHorizontalCardSkeleton key={useId()} />
            ))}
        </div>
    );
};

export default HorizontalListSkeleton; 