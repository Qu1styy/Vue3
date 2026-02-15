Vue.component('column-column', {
    props: ['title', 'tasks', 'column'],
    template: `
        <div class="column">
            <h4>{{ title }}</h4>

            <task-card
                v-for="task in tasks"
                :key="task.id"
                :task="task"
                :column="column"
                @edit="$emit('edit', $event)"
                @delete="$emit('delete', $event)"
                @move-forward="$emit('move-forward', $event)"
                @move-back="$emit('move-back', $event)"
            ></task-card>

        </div>
    `
})

Vue.component('kanban-column', {
    props: ['title', 'tasks', 'column'],
    template: `
        <div class="column">
            <h4>{{ title }}</h4>
            <task-card
                v-for="task in tasks"
                :key="task.id"
                :task="task"
                :column="column"
                @edit="$emit('edit', $event)"
                @delete="$emit('delete', $event)"
                @move-forward="$emit('move-forward', $event)"
                @move-back="$emit('move-back', $event)"
            ></task-card>
        </div>
    `
})

Vue.component('task-card', {
    props: ['task', 'column'],
    methods: {
        moveBack() {
            const reason = prompt('Укажите причину возврата')
            if (!reason) return
            this.$emit('move-back', { task: this.task, reason })
        }
    },
    template: `
        <div class="card mb-3"
            :class="{
                'card-overdue': column === 'done' && task.isCompletedInTime === false,
                'card-success': column === 'done' && task.isCompletedInTime === true
            }">
            <div class="card-body">
                <h5>{{ task.title }}</h5>
                <p>{{ task.description }}</p>
                <small>Создано: {{ task.createdAt }}</small><br>
                <small>Обновлено: {{ task.updatedAt }}</small><br>
                <small>Дедлайн: {{ task.deadline }}</small><br>
                <small v-if="task.returnReason">Причина возврата: {{ task.returnReason }}</small>

                <div class="mt-2">

                    <button
                        v-if="column !== 'done'"
                        @click="$emit('edit', task)"
                        class="btn btn-sm btn-warning me-1">
                        редактировать
                    </button>

                    <button
                        v-if="column === 'todo'"
                        @click="$emit('delete', task)"
                        class="btn btn-sm btn-danger me-1">
                        удалить
                    </button>

                    <button
                        v-if="column !== 'done'"
                        @click="$emit('move-forward', task)"
                        class="btn btn-sm btn-success me-1">
                        дальше
                    </button>

                    <button
                        v-if="column === 'testing'"
                        @click="moveBack"
                        class="btn btn-sm btn-secondary">
                        назад
                    </button>

                </div>
            </div>
        </div>
    `
})

Vue.component('create-task', {
    data() {
        return {
            title: '',
            description: '',
            deadline: ''
        }
    },
    methods: {
        create() {
            if (!this.title || !this.deadline) return

            const now = new Date().toLocaleString('ru-RU')

            const task = {
                id: Date.now(),
                title: this.title,
                description: this.description,
                createdAt: now,
                updatedAt: now,
                deadlineRaw: this.deadline,
                deadline: new Date(this.deadline).toLocaleString('ru-RU'),
                status: 'todo',
                returnReason: null,
                isCompletedInTime: null
            }

            this.$emit('create', task)

            this.title = ''
            this.description = ''
            this.deadline = ''
        }
    },
    template: `
        <div class="p-3">
            <h4>Создать задачу</h4>
            <input v-model="title" class="form-control mb-2" placeholder="Заголовок">
            <textarea v-model="description" class="form-control mb-2" placeholder="Описание"></textarea>
            <input type="datetime-local" v-model="deadline" class="form-control mb-2">
            <button @click="create" class="btn btn-primary">Создать</button>
        </div>
    `
})

new Vue({
    el: '#app',
    data: {
        columnConfig: [
            { key: 'todo', title: 'Запланированные задачи' },
            { key: 'inProgress', title: 'Задачи в работе' },
            { key: 'testing', title: 'Тестирование' },
            { key: 'done', title: 'Выполненные задачи' }
        ],

        columns: {
            todo: [],
            inProgress: [],
            testing: [],
            done: []
        }
    },

    methods: {
        addTask(task) {
            this.columns.todo.push(task)
            this.save()
        },

        editTask(task) {
            const title = prompt('Новый заголовок', task.title)
            if (title) task.title = title

            const description = prompt('Новое описание', task.description)
            if (description) task.description = description

            task.updatedAt = new Date().toLocaleString('ru-RU')
            this.save()
        },

        deleteTask(task) {
            this.columns.todo =
                this.columns.todo.filter(t => t.id !== task.id)
            this.save()
        },

        moveForward(task) {
            if (task.status === 'todo')
                this.move(task, 'todo', 'inProgress')
            else if (task.status === 'inProgress')
                this.move(task, 'inProgress', 'testing')
            else if (task.status === 'testing')
                this.finishTask(task)
        },

        moveBack({ task, reason }) {
            task.returnReason = reason
            this.move(task, 'testing', 'inProgress')
        },

        finishTask(task) {
            const deadline = new Date(task.deadlineRaw)
            const now = new Date()

            task.isCompletedInTime = now <= deadline
            this.move(task, 'testing', 'done')
        },

        move(task, from, to) {
            this.columns[from] =
                this.columns[from].filter(t => t.id !== task.id)

            task.status = to
            task.updatedAt = new Date().toLocaleString('ru-RU')

            this.columns[to].push(task)
            this.save()
        },

        save() {
            localStorage.setItem('kanban', JSON.stringify(this.columns))
        },

        load() {
            const data = localStorage.getItem('kanban')
            if (data)
                this.columns = JSON.parse(data)
        }
    },

    mounted() {
        this.load()
    }
})