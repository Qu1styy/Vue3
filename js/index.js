Vue.component('create-task', {
    data() {
        return {
            title: '',
            description: '',
            deadline: ''
        }
    },
    methods:{
        create(){
            if (!this.title || !this.deadline) return
            const now = new Date().toLocaleString('ru-RU')

            const task = {
                id: Date.now(),
                title: this.title,
                description: this.description,
                createdAt: now,
                updatedAt: now,
                deadline: new Date(this.deadline).toLocaleString('ru-RU'),
                deadlineRaw: this.deadline,
                status: 'todo',
                returnReason: null,
                isCompletedInTime: false
            }

            this.$emit('create', task);

            this.title = ''
            this.description = ''
            this.deadline = ''

        }
    },
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
            task.returnReason = null
            this.move(task, 'testing', 'done')
        },

        moveForward(task) {
            if (task.status === 'todo'){
                this.move(task, 'todo', 'inProgress')
            }
            else if (task.status === 'inProgress'){
                this.move(task, 'inProgress', 'testing')
            }
            else if (task.status === 'testing'){
                this.finishTask(task)
            }
        },

        moveBack({ task, reason }) {
            task.returnReason = reason
            this.move(task, 'testing', 'inProgress')
        },

        move(task, from, to) {
            this.columns[from] = this.columns[from].filter(t => t.id !== task.id)
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
            if (data) this.columns = JSON.parse(data)
        }
    },

    mounted() {
        this.load()
    }

})