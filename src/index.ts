import { Elysia, t } from "elysia";
import { db } from "./db";
import { todos } from "./schema";
import { eq } from "drizzle-orm";

// 宣告全域 Bun 變數，避免 TS 報錯
declare const Bun: any;

const app = new Elysia()
  // 讓首頁指向靜態 HTML 檔案
  .get("/", () => Bun.file("public/index.html"))
  
  // 取得所有代辦事項 (READ)
  .get("/todos", async () => {
    const allTodos = await db.select().from(todos).all();
    return allTodos;
  })
  // 新增代辦事項 (CREATE)
  .post(
    "/todos",
    async ({ body }) => {
      // 強制型別斷言 (Type Assertion)，解決 TS2339 錯誤
      const { content } = body as { content: string };
      
      const newTodo = await db
        .insert(todos)
        .values({
          content: content,
        })
        .returning();
      return newTodo;
    },
    {
      body: t.Object({
        content: t.String(),
      }),
    }
  )
  // 更新代辦事項 (UPDATE)
  .patch(
    "/todos/:id",
    async ({ params, body, set }) => {
      // 解決 TS2769: 強制將 id 轉為數字，確保相容性
      const id = Number(params.id);
      
      // 解決 TS2339: 強制型別斷言
      const typedBody = body as { completed?: boolean; content?: string };
      
      const updateData: any = {};
      if (typedBody.completed !== undefined) updateData.completed = typedBody.completed;
      if (typedBody.content !== undefined) updateData.content = typedBody.content;

      if (Object.keys(updateData).length === 0) {
         set.status = 400; // Bad Request
         return "沒有提供要更新的資料";
      }

      const updatedTodo = await db
        .update(todos)
        .set(updateData)
        .where(eq(todos.id, id))
        .returning();

      // 錯誤處理
      if (updatedTodo.length === 0) {
        set.status = 404; // Not Found
        return "找不到該代辦事項";
      }
      
      return updatedTodo[0];
    },
    {
      params: t.Object({
        id: t.Numeric(), 
      }),
      body: t.Object({
        completed: t.Optional(t.Boolean()),
        content: t.Optional(t.String()),
      }),
    }
  )
  // 刪除代辦事項 (DELETE)
  .delete(
    "/todos/:id",
    async ({ params, set }) => {
      // 強制轉為數字
      const id = Number(params.id);
      
      const deletedTodo = await db
        .delete(todos)
        .where(eq(todos.id, id))
        .returning();
      
      // 錯誤處理
      if (deletedTodo.length === 0) {
        set.status = 404; // Not Found
        return "找不到該代辦事項，可能已被刪除";
      }

      return deletedTodo[0];
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  )
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
export default app;