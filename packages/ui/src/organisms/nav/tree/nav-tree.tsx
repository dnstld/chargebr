"use client";

import type { ReactNode } from "react";
import { useId, useState } from "react";
import { NavFolderTrigger } from "../../../atoms/nav/folder-trigger/nav-folder-trigger";
import { NavLeaf } from "../../../atoms/nav/leaf/nav-leaf";
import styles from "./nav-tree.module.css";

export type NavTreeNode =
  | {
      kind: "page";
      id: string;
      label: string;
      href: string;
      meta?: ReactNode;
      isCurrent?: boolean;
    }
  | {
      kind: "folder";
      id: string;
      label: string;
      children: readonly [NavTreeNode, ...NavTreeNode[]];
      isCurrent?: boolean;
      isExpandedByDefault?: boolean;
    };

export interface NavTreeProps {
  tree: readonly [NavTreeNode, ...NavTreeNode[]];
}

function initiallyExpanded(nodes: readonly NavTreeNode[]): Set<string> {
  const ids = new Set<string>();
  for (const node of nodes) {
    if (node.kind !== "folder") continue;
    if (node.isExpandedByDefault) ids.add(node.id);
    for (const id of initiallyExpanded(node.children)) ids.add(id);
  }
  return ids;
}

export function NavTree({ tree }: NavTreeProps) {
  const idPrefix = useId();
  const [expanded, setExpanded] = useState(() => initiallyExpanded(tree));

  const renderNodes = (nodes: readonly NavTreeNode[], depth: number) => (
    <ul className={styles.list ?? ""}>
      {nodes.map((node) => {
        if (node.kind === "page") {
          return (
            <li key={node.id}>
              <NavLeaf
                href={node.href}
                label={node.label}
                dot={depth > 0}
                {...(node.meta !== undefined ? { meta: node.meta } : {})}
                {...(node.isCurrent ? { isCurrent: true } : {})}
              />
            </li>
          );
        }

        const controls = `${idPrefix}-${node.id}`;
        const isExpanded = expanded.has(node.id);
        return (
          <li key={node.id}>
            <NavFolderTrigger
              label={node.label}
              isExpanded={isExpanded}
              controls={controls}
              {...(node.isCurrent ? { isCurrent: true } : {})}
              onToggle={() => {
                setExpanded((current) => {
                  const next = new Set(current);
                  if (next.has(node.id)) next.delete(node.id);
                  else next.add(node.id);
                  return next;
                });
              }}
            />
            <div id={controls} hidden={!isExpanded}>
              {renderNodes(node.children, depth + 1)}
            </div>
          </li>
        );
      })}
    </ul>
  );

  return <div className={styles.tree ?? ""}>{renderNodes(tree, 0)}</div>;
}
