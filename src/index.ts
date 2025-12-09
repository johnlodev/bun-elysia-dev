import { Elysia, t } from "elysia";
import { db } from "./db";
import { todos } from "./schema";
import { eq } from "drizzle-orm";

// 宣告全域 Bun 變數
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
      const newTodo = await db
        .insert(todos)
        .values({
          content: body.content,
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
      const id = params.id;
      
      const updateData: any = {};
      if (body.completed !== undefined) updateData.completed = body.completed;
      if (body.content !== undefined) updateData.content = body.content;

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
      const id = params.id;
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

// 關鍵新增：為了 Vercel 部署，必須將 app 匯出
export type App = typeof app;
export default app;