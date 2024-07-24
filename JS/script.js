document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const filterButtons = document.querySelectorAll('.filter button');

    loadTasks();

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const taskText = taskInput.value.trim();

        if (taskText !== '') {
            addTask(taskText);
            saveTasks();
            taskInput.value = '';
        }
    });

    taskList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-task')) {
            e.target.parentElement.remove();
            saveTasks();
        } else if (e.target.classList.contains('complete-task')) {
            e.target.parentElement.classList.toggle('completed');
            saveTasks();
        } else if (e.target.classList.contains('edit-task')) {
            const newTaskText = prompt('Edit task:', e.target.parentElement.textContent.trim());
            if (newTaskText) {
                e.target.parentElement.firstChild.textContent = newTaskText;
                saveTasks();
            }
        }
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterTasks(button.getAttribute('data-filter'));
        });
    });

    function addTask(taskText) {
        const li = document.createElement('li');
        li.draggable = true;
        li.innerHTML = `
            <span>${taskText}</span>
            <button class="complete-task">Complete</button>
            <button class="edit-task">Edit</button>
            <button class="delete-task">Delete</button>
        `;
        taskList.appendChild(li);
        addDragAndDrop(li);
    }

    function saveTasks() {
        const tasks = [];
        taskList.querySelectorAll('li').forEach(task => {
            tasks.push({
                text: task.firstChild.textContent.trim(),
                completed: task.classList.contains('completed')
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks'));
        if (tasks) {
            tasks.forEach(task => {
                addTask(task.text);
                if (task.completed) {
                    taskList.lastChild.classList.add('completed');
                }
            });
        }
    }

    function filterTasks(filter) {
        const tasks = taskList.querySelectorAll('li');
        tasks.forEach(task => {
            switch (filter) {
                case 'all':
                    task.style.display = '';
                    break;
                case 'completed':
                    task.style.display = task.classList.contains('completed') ? '' : 'none';
                    break;
                case 'incomplete':
                    task.style.display = task.classList.contains('completed') ? 'none' : '';
                    break;
            }
        });
    }

    function addDragAndDrop(element) {
        element.addEventListener('dragstart', dragStart);
        element.addEventListener('dragover', dragOver);
        element.addEventListener('drop', drop);
    }

    function dragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.id);
        e.target.classList.add('dragging');
    }

    function dragOver(e) {
        e.preventDefault();
        const afterElement = getDragAfterElement(e.clientY);
        const dragging = document.querySelector('.dragging');
        if (afterElement == null) {
            taskList.appendChild(dragging);
        } else {
            taskList.insertBefore(dragging, afterElement);
        }
    }

    function drop(e) {
        e.preventDefault();
        const id = e.dataTransfer.getData('text');
        const draggable = document.getElementById(id);
        draggable.classList.remove('dragging');
        saveTasks();
    }

    function getDragAfterElement(y) {
        const draggableElements = [...taskList.querySelectorAll('li:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
});