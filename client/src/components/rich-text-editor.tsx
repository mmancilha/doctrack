import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Placeholder } from "@tiptap/extension-placeholder";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Undo,
  Redo,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder,
  editable = true,
}: RichTextEditorProps) {
  const { t } = useTranslation("documents");
  const effectivePlaceholder = placeholder || t("editor.contentPlaceholder");
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-md max-w-full h-auto",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse border border-border",
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-border p-2",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-border p-2 bg-muted font-medium",
        },
      }),
      Placeholder.configure({
        placeholder: effectivePlaceholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-4",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt(t("richEditor.promptUrl"));
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor, t]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt(t("richEditor.promptImageUrl"));
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor, t]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) {
    return (
      <div className="border rounded-lg bg-card p-4 min-h-[500px] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">{t("richEditor.loading")}</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border rounded-lg bg-card overflow-hidden"
    >
      {editable && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30 sticky top-0 z-10">
          <div className="flex items-center gap-0.5">
            <ToolbarButton
              icon={Undo}
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              tooltip={t("richEditor.undo")}
              testId="button-undo"
            />
            <ToolbarButton
              icon={Redo}
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              tooltip={t("richEditor.redo")}
              testId="button-redo"
            />
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <div className="flex items-center gap-0.5">
            <ToolbarButton
              icon={Heading1}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive("heading", { level: 1 })}
              tooltip={t("richEditor.heading1")}
              testId="button-h1"
            />
            <ToolbarButton
              icon={Heading2}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive("heading", { level: 2 })}
              tooltip={t("richEditor.heading2")}
              testId="button-h2"
            />
            <ToolbarButton
              icon={Heading3}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive("heading", { level: 3 })}
              tooltip={t("richEditor.heading3")}
              testId="button-h3"
            />
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <div className="flex items-center gap-0.5">
            <ToolbarButton
              icon={Bold}
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              tooltip={`${t("richEditor.bold")} (⌘B)`}
              testId="button-bold"
            />
            <ToolbarButton
              icon={Italic}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              tooltip={`${t("richEditor.italic")} (⌘I)`}
              testId="button-italic"
            />
            <ToolbarButton
              icon={UnderlineIcon}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive("underline")}
              tooltip={`${t("richEditor.underline")} (⌘U)`}
              testId="button-underline"
            />
            <ToolbarButton
              icon={Strikethrough}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive("strike")}
              tooltip={t("richEditor.strikethrough")}
              testId="button-strike"
            />
            <ToolbarButton
              icon={Code}
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive("code")}
              tooltip={t("richEditor.code")}
              testId="button-code"
            />
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <div className="flex items-center gap-0.5">
            <ToolbarButton
              icon={List}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
              tooltip={t("richEditor.bulletList")}
              testId="button-bullet-list"
            />
            <ToolbarButton
              icon={ListOrdered}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
              tooltip={t("richEditor.orderedList")}
              testId="button-ordered-list"
            />
            <ToolbarButton
              icon={Quote}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive("blockquote")}
              tooltip={t("richEditor.quote")}
              testId="button-quote"
            />
            <ToolbarButton
              icon={Minus}
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              tooltip={t("richEditor.horizontalRule")}
              testId="button-hr"
            />
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <div className="flex items-center gap-0.5">
            <ToolbarButton
              icon={LinkIcon}
              onClick={addLink}
              isActive={editor.isActive("link")}
              tooltip={t("richEditor.addLink")}
              testId="button-link"
            />
            <ToolbarButton
              icon={ImageIcon}
              onClick={addImage}
              tooltip={t("richEditor.addImage")}
              testId="button-image"
            />
            <ToolbarButton
              icon={TableIcon}
              onClick={insertTable}
              tooltip={t("richEditor.insertTable")}
              testId="button-table"
            />
          </div>
        </div>
      )}

      <EditorContent editor={editor} data-testid="editor-content" />
    </motion.div>
  );
}

interface ToolbarButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  tooltip?: string;
  testId?: string;
  size?: "default" | "sm";
}

function ToolbarButton({
  icon: Icon,
  onClick,
  isActive = false,
  disabled = false,
  tooltip,
  testId,
  size = "default",
}: ToolbarButtonProps) {
  const button = (
    <Toggle
      size={size === "sm" ? "sm" : "default"}
      pressed={isActive}
      onPressedChange={() => onClick()}
      disabled={disabled}
      className="h-8 w-8 p-0 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
      data-testid={testId}
    >
      <Icon className="h-4 w-4" />
    </Toggle>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}
