Vue.component('kanban-column', {
    props: ['title', 'tasks', 'column'],
    template: `
        <div class="column">
            <h4>{{ title }}</h4>
            <task-card
                v-for="task in tasks"
                :key="task.id"
                :task="task"
                :column="column">
            </task-card>
        </div>
    `
})

Vue.component('task-card', {
    props: ['task', 'column'],
    methods: {
        methods: {
            moveBack() {
                const reason = prompt('Укажите причину возврата')
                if (!reason) return
                this.$emit('move-back', { task: this.task, reason })
            }
        }
    },
    template: `
        <div class="card mb-3">
            <div class="card-body"
            :class="{
                'card-overdue': column === 'done' && task.isCompletedInTime === false,
                'card-success': column === 'done' && task.isCompletedInTime === true
            }">
                <h5>{{ task.title }}</h5>
                <p>{{ task.description }}</p>
                <small>Создано: {{ task.createdAt }}</small><br>
                <small>Обновлено: {{ task.updatedAt }}</small><br>
                <small>Дедлайн: {{ task.deadline }}</small>
            </div>
            <div class="mt-2">
                <button v-if="column !== 'done'"
                        @click="$emit('move-forward', task)"
                        class="btn btn-sm btn-success">
                    дальше
                </button>
            </div>
            <button v-if="column === 'testing'"
                    @click="moveBack"
                    class="btn btn-sm btn-secondary">
                назад
            </button>
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

Vue.component('task-card', {
    props: {
        task: Object,
        column: String
    },
    methods: {
        editTask(task) {
            this.$emit('edit', this.task)
        },
        moveTask(task) {
            this.$emit('move-forward', this.task)
        },
        moveBack(){
            const reason = prompt('Please indicate the reason for return');
            if(!reason) return
            this.$emit('move-back', { task: this.task, reason });
        }
    }
})

new Vue({
    el: '#app',
    data: {
        columns: {
            todo: [],
            inProgress: [],
            testing: [],
            done: []
        }
    },
    methods: {
        addTask(task){
            this.columns.todo.push(task)
            this.save()
        },

        editTask(task){

            const isOverdue =
                task.status !== 'done' &&
                new Date() > new Date(task.deadlineRaw)

            if (isOverdue) {
                alert('The date of overdue notes cannot be changed')
                return
            }

            const title = prompt('New title', task.title)
            if (title) {
                task.title = title
            }

            const newDeadline = prompt('New deadline', task.deadlineRaw)
            if (newDeadline) {
                task.deadlineRaw = newDeadline
                task.deadline = new Date(newDeadline).toLocaleString('ru-RU')
            }

            task.updatedAt = new Date().toLocaleString('ru-RU')
            this.save()
        },

        deleteTask(task) {
            this.columns[task.status] =
                this.columns[task.status].filter(t => t.id !== task.id)
            this.save()
        },

        finishTask(task) {
            const deadline = new Date(task.deadlineRaw)
            const now = new Date()

            task.isCompletedInTime = now <= deadline
            this.move(task, 'testing', 'done')
        },

        moveForward(task) {
            if (task.status === 'todo')
                this.move(task, 'todo', 'inProgress')
            else if (task.status === 'inProgress')
                this.move(task, 'inProgress', 'testing')
            else if (task.status === 'testing')
                this.finishTask(task)
        },

        move(task, from, to) {
            this.columns[from] =
                this.columns[from].filter(t => t.id !== task.id)

            task.status = to
            task.updatedAt = new Date().toLocaleString('ru-RU')

            this.columns[to].push(task)
        },

        moveBack({ task, reason }) {
            task.returnReason = reason
            this.move(task, 'testing', 'inProgress')
        },

        save() {
            localStorage.setItem('kanban', JSON.stringify(this.columns))
        },

        load() {
            const data = localStorage.getItem('kanban')
            if (data) this.columns = JSON.parse(data)
        },

    },

    mounted() {
        this.load()
    }

})