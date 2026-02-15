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