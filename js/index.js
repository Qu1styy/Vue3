Vue.component('create-task', {

    id,
    title,
    description,
    createdAt,
    updatedAt,
    deadline,
    deadlineRaw,
    status: 'todo',
    returnReason: null,
    isCompletedInTime: false

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
        moveBack(){},
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
        }
    }
})