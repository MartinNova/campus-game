"use client";

import { ArrowLeft, ArrowRight, Check, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { groupByColumn } from "@/lib/todo/todos";
import type { Todo, TodoColumn, TodoLabel } from "@/types/todo";
import { TaskMeta } from "./TaskMeta";

interface TaskBoardProps {
  columns: TodoColumn[];
  todos: Todo[];
  labels: TodoLabel[];
  today: string;
  onOpen: (todoId: string) => void;
  onMove: (todoId: string, columnId: string) => Promise<void>;
  onAddTask: (columnId: string, title: string) => Promise<void>;
  onAddColumn: (name: string) => Promise<void>;
  onRenameColumn: (columnId: string, name: string) => Promise<void>;
  onSetColumnDone: (columnId: string, isDone: boolean) => Promise<void>;
  onMoveColumn: (columnId: string, direction: -1 | 1) => Promise<void>;
  onDeleteColumn: (columnId: string) => Promise<void>;
}

const inputClass =
  "border-border bg-surface focus-visible:outline-brand h-9 w-full rounded-lg border px-2.5 text-sm focus-visible:outline-2";

/**
 * Trello/Notion-style board. Every list has its own columns: rename them, add more,
 * reorder them and mark which ones count as "done". Drag cards between columns.
 */
export function TaskBoard(props: TaskBoardProps) {
  const { columns, todos, labels, today, onOpen } = props;
  const groups = groupByColumn(todos, columns);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [addingColumn, setAddingColumn] = useState(false);
  const [columnDraft, setColumnDraft] = useState("");

  /** Runs an action. Returns false (and shows the error) if it fails. */
  async function attempt(action: () => Promise<void>): Promise<boolean> {
    setError(null);
    try {
      await action();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      return false;
    }
  }

  async function handleAddColumn(e: React.FormEvent) {
    e.preventDefault();
    if (await attempt(() => props.onAddColumn(columnDraft))) {
      setColumnDraft("");
      setAddingColumn(false);
    }
  }

  return (
    <>
      {error && (
        <p role="alert" className="mb-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="-mx-4 flex snap-x snap-mandatory items-start gap-3 overflow-x-auto px-4 pb-3">
        {columns.map((column, index) => (
          <Column
            key={column.id}
            column={column}
            todos={groups[column.id] ?? []}
            labels={labels}
            today={today}
            isFirst={index === 0}
            isLast={index === columns.length - 1}
            canDelete={columns.length > 1}
            highlighted={dragOver === column.id}
            attempt={attempt}
            onOpen={onOpen}
            onDragOver={() => setDragOver(column.id)}
            onDragLeave={() => setDragOver((current) => (current === column.id ? null : current))}
            onDropCard={(todoId) => {
              setDragOver(null);
              void attempt(() => props.onMove(todoId, column.id));
            }}
            onAddTask={(title) => props.onAddTask(column.id, title)}
            onRename={(name) => props.onRenameColumn(column.id, name)}
            onSetDone={(isDone) => props.onSetColumnDone(column.id, isDone)}
            onMoveColumn={(direction) => props.onMoveColumn(column.id, direction)}
            onDelete={() => props.onDeleteColumn(column.id)}
          />
        ))}

        <div className="w-[78%] max-w-xs shrink-0 snap-start sm:w-72">
          {addingColumn ? (
            <form onSubmit={handleAddColumn} className="bg-muted/10 grid gap-2 rounded-2xl p-3">
              <label className="text-sm font-medium">
                Column name
                <input
                  autoFocus
                  value={columnDraft}
                  onChange={(e) => setColumnDraft(e.target.value)}
                  maxLength={24}
                  placeholder="e.g. In review"
                  className={`${inputClass} mt-1`}
                />
              </label>
              <div className="flex gap-2">
                <Button type="submit">Add column</Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setAddingColumn(false);
                    setColumnDraft("");
                    setError(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setAddingColumn(true)}
              className="border-border text-muted hover:border-brand hover:text-foreground focus-visible:outline-brand flex h-12 w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed text-sm font-medium focus-visible:outline-2"
            >
              <Plus className="size-4" aria-hidden /> Add another column
            </button>
          )}
        </div>
      </div>
    </>
  );
}

interface ColumnProps {
  column: TodoColumn;
  todos: Todo[];
  labels: TodoLabel[];
  today: string;
  isFirst: boolean;
  isLast: boolean;
  canDelete: boolean;
  highlighted: boolean;
  attempt: (action: () => Promise<void>) => Promise<boolean>;
  onOpen: (todoId: string) => void;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDropCard: (todoId: string) => void;
  onAddTask: (title: string) => Promise<void>;
  onRename: (name: string) => Promise<void>;
  onSetDone: (isDone: boolean) => Promise<void>;
  onMoveColumn: (direction: -1 | 1) => Promise<void>;
  onDelete: () => Promise<void>;
}

function Column(props: ColumnProps) {
  const { column, todos, labels, today, attempt } = props;
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(column.name);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [adding, setAdding] = useState(false);
  const [cardDraft, setCardDraft] = useState("");

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    if (await attempt(() => props.onRename(nameDraft))) setRenaming(false);
  }

  async function handleAddCard(e: React.FormEvent) {
    e.preventDefault();
    if (cardDraft.trim() === "") return;
    if (await attempt(() => props.onAddTask(cardDraft))) setCardDraft("");
  }

  const menuButton =
    "hover:bg-border/60 focus-visible:outline-brand flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm focus-visible:outline-2 disabled:opacity-40";

  return (
    <section
      aria-label={column.name}
      onDragOver={(e) => {
        e.preventDefault();
        props.onDragOver();
      }}
      onDragLeave={props.onDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");
        if (id) props.onDropCard(id);
      }}
      className={`bg-muted/10 w-[78%] max-w-xs shrink-0 snap-start rounded-2xl p-3 sm:w-72 ${
        props.highlighted ? "ring-brand ring-2" : ""
      }`}
    >
      <div className="mb-3 flex items-center gap-1">
        {renaming ? (
          <form onSubmit={handleRename} className="flex flex-1 gap-1">
            <input
              autoFocus
              aria-label="Column name"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              maxLength={24}
              className={inputClass}
            />
            <Button type="submit" className="h-9 px-3" aria-label="Save column name">
              <Check className="size-4" aria-hidden />
            </Button>
          </form>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                setNameDraft(column.name);
                setRenaming(true);
              }}
              title="Rename column"
              className="focus-visible:outline-brand min-w-0 flex-1 truncate rounded-lg px-1 text-left text-sm font-semibold focus-visible:outline-2"
            >
              {column.name}
              {column.isDone && <span className="text-muted ml-1.5 text-xs font-normal">✓</span>}
            </button>
            <span className="text-muted text-xs">{todos.length}</span>
            <button
              type="button"
              aria-label={`Options for ${column.name}`}
              aria-expanded={menuOpen}
              onClick={() => {
                setMenuOpen((open) => !open);
                setConfirmDelete(false);
              }}
              className="text-muted hover:text-foreground hover:bg-border/60 focus-visible:outline-brand rounded-lg p-1 focus-visible:outline-2"
            >
              <MoreHorizontal className="size-4" aria-hidden />
            </button>
          </>
        )}
      </div>

      {menuOpen && (
        <div className="border-border bg-surface mb-3 rounded-xl border p-1 shadow-sm">
          <button
            type="button"
            className={menuButton}
            onClick={() => {
              setNameDraft(column.name);
              setRenaming(true);
              setMenuOpen(false);
            }}
          >
            Rename column
          </button>
          <button
            type="button"
            role="switch"
            aria-checked={column.isDone}
            className={menuButton}
            onClick={() => void attempt(() => props.onSetDone(!column.isDone))}
          >
            <span
              className={`flex size-4 items-center justify-center rounded border ${
                column.isDone ? "border-brand bg-brand text-brand-foreground" : "border-border"
              }`}
            >
              {column.isDone && <Check className="size-3" aria-hidden />}
            </span>
            Counts as done
          </button>
          <button
            type="button"
            disabled={props.isFirst}
            className={menuButton}
            onClick={() => void attempt(() => props.onMoveColumn(-1))}
          >
            <ArrowLeft className="size-4" aria-hidden /> Move left
          </button>
          <button
            type="button"
            disabled={props.isLast}
            className={menuButton}
            onClick={() => void attempt(() => props.onMoveColumn(1))}
          >
            <ArrowRight className="size-4" aria-hidden /> Move right
          </button>
          {confirmDelete ? (
            <div className="px-2 py-1.5 text-sm">
              <p>Delete this column? Its cards move to the first column.</p>
              <div className="mt-2 flex gap-2">
                <Button
                  variant="secondary"
                  className="h-8 px-3"
                  onClick={() => {
                    setMenuOpen(false);
                    void attempt(() => props.onDelete());
                  }}
                >
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  className="h-8 px-3"
                  onClick={() => setConfirmDelete(false)}
                >
                  Keep
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={!props.canDelete}
              className={`${menuButton} text-red-700 dark:text-red-400`}
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="size-4" aria-hidden /> Delete column
            </button>
          )}
        </div>
      )}

      <ul className="grid min-h-4 gap-2">
        {todos.map((todo) => (
          <li
            key={todo.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", todo.id)}
            className="border-border bg-surface cursor-grab rounded-xl border shadow-sm active:cursor-grabbing"
          >
            <button
              type="button"
              onClick={() => props.onOpen(todo.id)}
              className="focus-visible:outline-brand block w-full rounded-xl p-3 text-left focus-visible:outline-2"
            >
              <span
                className={`block text-sm break-words ${todo.done ? "text-muted line-through" : "font-medium"}`}
              >
                {todo.title}
              </span>
              <span className="mt-2 block">
                <TaskMeta todo={todo} today={today} labels={labels} />
              </span>
            </button>
          </li>
        ))}
      </ul>

      {adding ? (
        <form onSubmit={handleAddCard} className="mt-2 grid gap-2">
          <input
            autoFocus
            aria-label={`New card in ${column.name}`}
            value={cardDraft}
            onChange={(e) => setCardDraft(e.target.value)}
            maxLength={120}
            placeholder="Enter a title"
            className={inputClass}
          />
          <div className="flex gap-2">
            <Button type="submit" className="h-8 px-3">
              Add card
            </Button>
            <Button
              variant="ghost"
              className="h-8 px-3"
              onClick={() => {
                setAdding(false);
                setCardDraft("");
              }}
            >
              Close
            </Button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-muted hover:bg-border/60 hover:text-foreground focus-visible:outline-brand mt-2 flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm focus-visible:outline-2"
        >
          <Plus className="size-4" aria-hidden /> Add a card
        </button>
      )}
    </section>
  );
}
