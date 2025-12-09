export const indexHTML = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Turso Todo App</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 600px; margin: 2rem auto; padding: 0 1rem; background-color: #f5f5f5; color: #333; }
        .container { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { margin-top: 0; color: #2c3e50; text-align: center; }
        .input-group { display: flex; gap: 10px; margin-bottom: 2rem; }
        input[type="text"] { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }
        button#add-btn { padding: 10px 20px; background-color: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        button#add-btn:hover { background-color: #2563eb; }
        ul { list-style: none; padding: 0; }
        li { display: flex; align-items: center; padding: 12px; border-bottom: 1px solid #eee; gap: 10px; }
        li:last-child { border-bottom: none; }
        .todo-content { flex: 1; font-size: 18px; }
        .todo-content.completed { text-decoration: line-through; color: #888; }
        button { cursor: pointer; border: none; border-radius: 4px; padding: 6px 12px; color: white; margin-left: 5px; }
        .edit-btn { background-color: #f59e0b; }
        .delete-btn { background-color: #ef4444; }
        .preview-banner { background-color: #fff3cd; color: #856404; border: 1px solid #ffeeba; padding: 10px; margin-bottom: 20px; border-radius: 4px; text-align: center; font-size: 14px; display: none; }
        .error-message { color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 4px; margin-bottom: 20px; text-align: center; }
        input[type="checkbox"] { width: 20px; height: 20px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="container">
        <div id="preview-banner" class="preview-banner">⚠️ <strong>預覽模式</strong>：目前使用模擬資料，若要完整功能請開啟 Port 3000 的網址。</div>
        <h1>待辦事項清單</h1>
        <div class="input-group"><input type="text" id="todo-input" placeholder="新增待辦事項..." /><button id="add-btn">新增</button></div>
        <ul id="todo-list"></ul>
    </div>
    <script>
        const isPreview = window.location.protocol === 'blob:' || window.location.protocol === 'file:';
        const API_URL = '/todos';
        let localTodos = [{ id: 1, content: "範例事項 (預覽模式)", completed: false }, { id: 2, content: "重新整理後資料會重置", completed: true }];
        const listElement = document.getElementById('todo-list');
        const inputElement = document.getElementById('todo-input');
        const addBtn = document.getElementById('add-btn');
        const previewBanner = document.getElementById('preview-banner');
        if (isPreview) { previewBanner.style.display = 'block'; }
        async function fetchTodos() {
            if (isPreview) { renderTodos(localTodos); return; }
            try {
                const res = await fetch(API_URL);
                if (!res.ok) throw new Error(\`HTTP error! status: \${res.status}\`);
                const todos = await res.json();
                renderTodos(todos);
            } catch (error) {
                console.error("Fetch Error:", error);
                previewBanner.style.display = 'block';
                previewBanner.innerHTML = \`⚠️ 無法連線至後端，已切換至離線模擬模式。\`;
                renderTodos(localTodos);
            }
        }
        function renderTodos(todos) {
            listElement.innerHTML = '';
            if (todos.length === 0) { listElement.innerHTML = '<li style="justify-content:center; color:#888;">目前沒有待辦事項</li>'; return; }
            todos.forEach(todo => {
                const li = document.createElement('li');
                const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = todo.completed;
                checkbox.onchange = () => updateTodo(todo.id, { completed: checkbox.checked });
                const span = document.createElement('span'); span.className = \`todo-content \${todo.completed ? 'completed' : ''}\`; span.textContent = todo.content;
                const editBtn = document.createElement('button'); editBtn.className = 'edit-btn'; editBtn.textContent = '編輯';
                editBtn.onclick = () => editTodoContent(todo.id, todo.content);
                const delBtn = document.createElement('button'); delBtn.className = 'delete-btn'; delBtn.textContent = '刪除';
                delBtn.onclick = () => deleteTodo(todo.id);
                li.append(checkbox, span, editBtn, delBtn); listElement.appendChild(li);
            });
        }
        async function addTodo() {
            const content = inputElement.value.trim(); if (!content) return;
            if (isPreview) { const newId = localTodos.length > 0 ? Math.max(...localTodos.map(t => t.id)) + 1 : 1; localTodos.push({ id: newId, content, completed: false }); inputElement.value = ''; renderTodos(localTodos); return; }
            try { await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) }); inputElement.value = ''; fetchTodos(); } catch (error) { alert('新增失敗'); }
        }
        async function updateTodo(id, updates) {
            if (isPreview) { const todo = localTodos.find(t => t.id === id); if (todo) Object.assign(todo, updates); renderTodos(localTodos); return; }
            try { const res = await fetch(\`\${API_URL}/\${id}\`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) }); if (res.status === 404) { alert('該項目已不存在'); fetchTodos(); return; } fetchTodos(); } catch (error) { console.error(error); }
        }
        async function editTodoContent(id, oldContent) {
            const newContent = prompt("請輸入新的內容:", oldContent);
            if (newContent === null || newContent.trim() === "" || newContent === oldContent) return;
            await updateTodo(id, { content: newContent });
        }
        async function deleteTodo(id) {
            if(!confirm('確定要刪除嗎？')) return;
            if (isPreview) { localTodos = localTodos.filter(t => t.id !== id); renderTodos(localTodos); return; }
            try { const res = await fetch(\`\${API_URL}/\${id}\`, { method: 'DELETE' }); if (res.status === 404) alert('刪除失敗：該項目可能已不存在'); fetchTodos(); } catch (error) { alert('刪除失敗'); }
        }
        addBtn.addEventListener('click', addTodo);
        inputElement.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTodo(); });
        fetchTodos();
    </script>
</body>
</html>
`;