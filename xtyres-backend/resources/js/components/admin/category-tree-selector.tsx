import { localizedText } from '@/lib/utils';

type CategoryNode = {
    id: number;
    name: Record<string, string>;
    children?: CategoryNode[];
};

type CategoryTreeSelectorProps = {
    nodes: CategoryNode[];
    selectedIds: number[];
    onToggle: (id: number) => void;
};

export function CategoryTreeSelector({
    nodes,
    selectedIds,
    onToggle,
}: CategoryTreeSelectorProps) {
    return (
        <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
            {nodes.map((node) => (
                <CategoryNodeView
                    key={node.id}
                    node={node}
                    selectedIds={selectedIds}
                    onToggle={onToggle}
                    depth={0}
                />
            ))}
        </div>
    );
}

function CategoryNodeView({
    node,
    selectedIds,
    onToggle,
    depth,
}: {
    node: CategoryNode;
    selectedIds: number[];
    onToggle: (id: number) => void;
    depth: number;
}) {
    const checked = selectedIds.includes(node.id);

    return (
        <div className="space-y-3">
            <label
                className="flex items-center gap-3 text-sm font-medium text-foreground"
                style={{ paddingLeft: `${depth * 14}px` }}
            >
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(node.id)}
                    className="size-4 rounded border-border text-primary focus:ring-primary"
                />
                <span>{localizedText(node.name)}</span>
            </label>

            {node.children?.length ? (
                <div className="space-y-3">
                    {node.children.map((child) => (
                        <CategoryNodeView
                            key={child.id}
                            node={child}
                            selectedIds={selectedIds}
                            onToggle={onToggle}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    );
}
