
        // Mobile menu toggle
        const mobileMenu = document.getElementById('mobileMenu');
        const navLinks = document.getElementById('navLinks');
        const todoInput = document.getElementById('todoInput');
        const addBtn = document.getElementById('addBtn');
        const todoList = document.getElementById('todoList');
        const clearCompleted = document.getElementById('clearCompleted');
        const stats = document.getElementById('stats');
        
        let todos = [];
        let todoId = 0;

        // Load todos from localStorage
        function loadTodos() {
            const savedTodos = localStorage.getItem('awamTodos');
            if (savedTodos) {
                todos = JSON.parse(savedTodos);
                todoId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 0;
            }
        }

        // Save todos to localStorage
        function saveTodos() {
            localStorage.setItem('awamTodos', JSON.stringify(todos));
        }

        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });

        // Add todo
        function addTodo() {
            const text = todoInput.value.trim();
            if (text) {
                const todo = {
                    id: todoId++,
                    text: text,
                    completed: false
                };
                todos.push(todo);
                todoInput.value = '';
                saveTodos();
                renderTodos();
                updateStats();
            }
        }

        // Toggle todo completion
        function toggleTodo(id) {
            const todo = todos.find(t => t.id === id);
            if (todo) {
                todo.completed = !todo.completed;
                saveTodos();
                renderTodos();
                updateStats();
            }
        }

        // Delete todo
        function deleteTodo(id) {
            todos = todos.filter(t => t.id !== id);
            saveTodos();
            renderTodos();
            updateStats();
        }

        // Clear completed todos
        function clearCompletedTodos() {
            todos = todos.filter(t => !t.completed);
            saveTodos();
            renderTodos();
            updateStats();
        }

        // Render todos
        function renderTodos() {
            todoList.innerHTML = '';
            todos.forEach(todo => {
                const li = document.createElement('li');
                li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
                li.innerHTML = `
                    <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${todo.id})">
                    <span class="todo-text">${todo.text}</span>
                    <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
                `;
                todoList.appendChild(li);
            });
        }

        // Update stats
        function updateStats() {
            const total = todos.length;
            const completed = todos.filter(t => t.completed).length;
            const remaining = total - completed;
            
            stats.innerHTML = `<span>${total} tasks total • ${completed} completed • ${remaining} remaining</span>`;
            clearCompleted.disabled = completed === 0;
        }

        // Event listeners
        addBtn.addEventListener('click', addTodo);
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTodo();
        });
        clearCompleted.addEventListener('click', clearCompletedTodos);

        // Initialize
        loadTodos();
        renderTodos();
        updateStats();