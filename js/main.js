Vue.component('column-column', {
    props: {
        title: {
            type: String,
            required: true
        },
        tasks: {
            type: Array,
            required: true
        },
        taskActions: {
            type: Object,
            default() {
                return {
                    edit: false,
                    delete: false,
                    forward: false,
                    back: false
                }
            }
        }
    },

    template: `
        <div class="column card border-0 shadow-sm h-100">
            <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
                <h5 class="mb-0 fs-6 fw-semibold">{{ title }}</h5>
            </div>

            <div class="card-body p-3">
                <p v-if="!tasks.length" class="text-secondary small mb-0">Задач пока нет</p>

                <task-card
                    v-for="task in tasks"
                    :key="task.id"
                    :task="task"
                    :can-edit="taskActions.edit"
                    :can-delete="taskActions.delete"
                    :can-move-forward="taskActions.forward"
                    :can-move-back="taskActions.back"
                    @edit="$emit('task-edit', $event)"
                    @delete="$emit('task-delete', $event)"
                    @forward="$emit('task-forward', $event)"
                    @back="$emit('task-back', $event)"
                ></task-card>
            </div>
        </div>
    `
})

Vue.component('task-card', {
    props: {
        task: {
            type: Object,
            required: true
        },
        canEdit: {
            type: Boolean,
            default: false
        },
        canDelete: {
            type: Boolean,
            default: false
        },
        canMoveForward: {
            type: Boolean,
            default: false
        },
        canMoveBack: {
            type: Boolean,
            default: false
        }
    },

    methods: {
        edit() {
            const title = prompt('Новый заголовок', this.task.title)
            if (title) this.task.title = title

            const description = prompt('Новое описание', this.task.description)
            if (description) this.task.description = description

            const deadline = prompt(
                'Новый дедлайн (YYYY-MM-DDTHH:mm)',
                this.task.deadlineRaw || ''
            )

            if (deadline) {
                const parsedDeadline = new Date(deadline)
                if (!Number.isNaN(parsedDeadline.getTime())) {
                    this.task.deadlineRaw = deadline
                    this.task.deadline = parsedDeadline.toLocaleString('ru-RU')
                }
            }

            this.task.updatedAt = new Date().toLocaleString('ru-RU')
            this.$emit('edit', this.task)
        },

        deleteTask() {
            this.$emit('delete', this.task)
        },

        moveForward() {
            this.$emit('forward', this.task)
        },

        moveBack() {
            const reason = prompt('Укажите причину возврата')
            if (!reason) return
            this.$emit('back', { task: this.task, reason })
        }
    },

    template: `
        <div class="card task-card mb-3 border-0 shadow-sm">
            <div class="card-body p-3">
                <div class="mb-2">
                    <h6 class="mb-0 fw-semibold">{{ task.title }}</h6>
                </div>

                <p class="text-body-secondary small mb-3">{{ task.description || 'Без описания' }}</p>

                <div class="small text-body-secondary mb-3">
                    <div class="mb-1"><span class="fw-semibold text-body">Создано:</span> {{ task.createdAt }}</div>
                    <div class="mb-1"><span class="fw-semibold text-body">Обновлено:</span> {{ task.updatedAt }}</div>
                    <div><span class="fw-semibold text-body">Дедлайн:</span> {{ task.deadline }}</div>
                </div>

                <template v-if="task.status === 'done' && typeof task.inDeadline === 'boolean'">
                    <p v-if="task.inDeadline" class="text-success small fw-semibold in_dead_line_p">Работа выполнена в срок</p>
                    <p v-else class="text-danger small fw-semibold in_dead_line_p">Работа просрочена</p>
                </template>

                <div v-if="task.returnReason" class="alert alert-secondary py-2 px-3 small mb-3">
                    Причина возврата: {{ task.returnReason }}
                </div>

                <div class="d-flex flex-wrap gap-2">

                    <button v-if="canEdit" @click="edit" class="btn btn-sm btn-outline-warning">
                        Редактировать
                    </button>

                    <button v-if="canDelete" @click="deleteTask" class="btn btn-sm btn-outline-danger">
                        Удалить
                    </button>

                    <button v-if="canMoveForward" @click="moveForward" class="btn btn-sm btn-success">
                        Дальше
                    </button>

                    <button v-if="canMoveBack" @click="moveBack" class="btn btn-sm btn-secondary">
                        Назад
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
                inDeadline: null
            }

            this.$emit('create-task', task)

            this.title = ''
            this.description = ''
            this.deadline = ''
        }
    },

    template: `
        <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                    <h4 class="mb-0 fs-5">Создать задачу</h4>
                </div>

                <div class="row g-3">
                    <div class="col-12 col-lg-4">
                        <label class="form-label small fw-semibold">Заголовок</label>
                        <input v-model="title" class="form-control" placeholder="Заголовок">
                    </div>

                    <div class="col-12 col-lg-5">
                        <label class="form-label small fw-semibold">Описание</label>
                        <textarea v-model="description" class="form-control" rows="1" placeholder="Описание"></textarea>
                    </div>

                    <div class="col-12 col-lg-3">
                        <label class="form-label small fw-semibold">Дедлайн</label>
                        <input type="datetime-local" v-model="deadline" class="form-control">
                    </div>

                    <div class="col-12 d-flex justify-content-end">
                        <button @click="create" class="btn btn-primary px-4">Создать</button>
                    </div>
                </div>
            </div>
        </div>
    `
})

Vue.component('task-app', {
    template: `
        <div class="board py-4">
            <div class="container-fluid">
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                    <div>
                        <h1 class="h4 mb-1">Task app</h1>
                        <p class="text-secondary mb-0">Управление задачами по этапам</p>
                    </div>
                </div>

                <div class="row g-4">
                    <div class="col-12">
                        <create-task @create-task="handleCreateTask"></create-task>
                    </div>

                    <div class="col-12">
                        <div class="row g-3 align-items-start">
                            <div
                                v-for="col in columnConfig"
                                :key="col.key"
                                class="col-12 col-md-6 col-xxl-3"
                            >
                                <column-column
                                    :title="col.title"
                                    :tasks="columns[col.key]"
                                    :task-actions="col.actions"
                                    @task-edit="handleEditTask"
                                    @task-delete="handleDeleteTask"
                                    @task-forward="handleMoveForward"
                                    @task-back="handleMoveBack"
                                ></column-column>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    data() {
        return {
            columnConfig: [
                {
                    key: 'todo',
                    title: 'Запланированные задачи',
                    actions: { edit: true, delete: true, forward: true, back: false }
                },
                {
                    key: 'inProgress',
                    title: 'Задачи в работе',
                    actions: { edit: true, delete: false, forward: true, back: false }
                },
                {
                    key: 'testing',
                    title: 'Тестирование',
                    actions: { edit: true, delete: false, forward: true, back: true }
                },
                {
                    key: 'done',
                    title: 'Выполненные задачи',
                    actions: { edit: false, delete: true, forward: false, back: false }
                }
            ],

            columns: {
                todo: [],
                inProgress: [],
                testing: [],
                done: []
            }
        }
    },

    mounted() {
        this.load()
    },

    methods: {
        deleteTask(taskId) {
            Object.keys(this.columns).forEach(columnKey => {
                this.columns[columnKey] = this.columns[columnKey].filter(task => task.id !== taskId)
            })
        },

        moveForward(task) {
            if (task.status === 'todo')
                return this.move(task, 'todo', 'inProgress')

            if (task.status === 'inProgress')
                return this.move(task, 'inProgress', 'testing')

            if (task.status === 'testing')
                return this.move(task, 'testing', 'done')

            return false
        },

        moveBack(task, reason) {
            task.returnReason = reason
            this.move(task, 'testing', 'inProgress')
        },

        move(task, from, to) {
            if (to === 'done') {
                const deadlineTime = new Date(task.deadlineRaw).getTime()
                const nowTime = Date.now()
                task.inDeadline = Number.isNaN(deadlineTime) ? false : nowTime <= deadlineTime
            } else {
                task.inDeadline = null
            }

            this.columns[from] = this.columns[from].filter(item => item.id !== task.id)
            task.status = to
            this.columns[to].push(task)
            return true
        },

        save() {
            localStorage.setItem('kanban', JSON.stringify(this.columns))
        },

        normalizeTask(task) {
            if (typeof task.inDeadline === 'boolean') return

            if (task.status === 'done') {
                const deadlineTime = new Date(task.deadlineRaw).getTime()
                task.inDeadline = Number.isNaN(deadlineTime) ? false : Date.now() <= deadlineTime
            } else {
                task.inDeadline = null
            }
        },

        load() {
            const data = localStorage.getItem('kanban')
            if (!data) return

            const columns = JSON.parse(data)
            Object.values(columns).forEach(tasks => {
                tasks.forEach(task => this.normalizeTask(task))
            })

            this.columns = columns
        },

        handleCreateTask(task) {
            this.columns.todo.push(task)
            this.save()
        },

        handleEditTask() {
            this.save()
        },

        handleDeleteTask(task) {
            this.deleteTask(task.id)
            this.save()
        },

        handleMoveForward(task) {
            const isMoved = this.moveForward(task)
            if (isMoved) this.save()
        },

        handleMoveBack({ task, reason }) {
            this.moveBack(task, reason)
            this.save()
        }
    }
})

new Vue({
    el: '#app'
})
