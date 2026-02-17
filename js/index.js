const Bus = new Vue()

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
            ></task-card>
        </div>
    `
})

Vue.component('task-card', {
    props: ['task', 'column'],

    computed: {
        isOverdue() {
            if (!this.task.deadlineRaw) return false
            const now = new Date()
            const deadline = new Date(this.task.deadlineRaw)
            return now > deadline && this.task.status === 'done'
        }
    },

    methods: {
        edit() {
            Bus.$emit('task:edit', this.task)
        },

        deleteTask() {
            Bus.$emit('task:delete', this.task)
        },

        moveForward() {
            Bus.$emit('task:forward', this.task)
        },

        moveBack() {
            const reason = prompt('Укажите причину возврата')
            if (!reason) return
            Bus.$emit('task:back', { task: this.task, reason })
        }
    },

    template: `
        <div class="card mb-3">
            <div class="card-body">
                <h5>{{ task.title }}</h5>
                <p>{{ task.description }}</p>
                <small>Создано: {{ task.createdAt }}</small><br>
                <small>Обновлено: {{ task.updatedAt }}</small><br>
                <small>Дедлайн: {{ task.deadline }}</small><br>
                <small v-if="isOverdue">Просрочено</small><br>
                <small v-if="task.returnReason">Причина возврата: {{ task.returnReason }}</small>

                <div class="mt-2">

                    <button v-if="column !== 'done'" @click="edit" class="btn btn-sm btn-warning me-1">
                        редактировать
                    </button>

                    <button v-if="column === 'todo'" @click="deleteTask" class="btn btn-sm btn-danger me-1">
                        удалить
                    </button>

                    <button v-if="column !== 'done'" @click="moveForward" class="btn btn-sm btn-success me-1">
                        дальше
                    </button>

                    <button v-if="column === 'testing'" @click="moveBack" class="btn btn-sm btn-secondary">
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

            Bus.$emit('task:create', task)

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

Vue.component('app-root', {
    template: `
        <div class="board">
            <create-task></create-task>

            <div class="board-column">
                <column-column
                        v-for="col in columnConfig"
                        :key="col.key"
                        :title="col.title"
                        :column="col.key"
                        :tasks="columns[col.key]"
                ></column-column>
            </div>
        </div>
    `,

    data() {
        return {
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
        }
    },

    created() {
        Bus.$on('task:create', this.addTask)
        Bus.$on('task:edit', this.editTask)
        Bus.$on('task:delete', this.deleteTask)
        Bus.$on('task:forward', this.moveForward)
        Bus.$on('task:back', this.moveBack)
    },

    mounted() {
        this.load()
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
                this.move(task, 'testing', 'done')
        },

        moveBack({ task, reason }) {
            task.returnReason = reason
            this.move(task, 'testing', 'inProgress')
        },

        move(task, from, to) {
            this.columns[from] =
                this.columns[from].filter(t => t.id !== task.id)

            task.status = to
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
    }
})

new Vue({
    el: '#app'
})
