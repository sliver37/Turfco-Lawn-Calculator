<template>
    <div>
        <ul class="selection-wrap list-unstyled">
            <li @click="control = 'square'" class="selection-item square" :class="[control === 'square' ? 'active' : '']"><span /></li>
            <li @click="control = 'triangle'" class="selection-item triangle" :class="[control === 'triangle' ? 'active' : '']"><span /></li>
            <li @click="control = 'circle'" class="selection-item circle" :class="[control === 'circle' ? 'active' : '']"><span /></li>
            <li @click="control = 'arch'" class="selection-item arch" :class="[control === 'arch' ? 'active' : '']"><span /></li>
        </ul>
        <div class="control-wrap">
            <div v-if="control === 'square' || control === 'triangle'" class="simple-calc">
                <input name="width" v-model="width" />
                <input name="height" v-model="height" />
                <a @click.prevent="calcSimple" href="#">Add to Total</a>
            </div>
            <div v-if="control === 'circle'" class="diameter-calc">
                <input name="diameter" v-model="diameter" />
                <a @click.prevent="calcDiam" href="#">Add to Total</a>
            </div>
            <div v-if="control === 'arch'" class="radius-calc">
                <input name="radius" v-model="radius" />
                <a @click.prevent="calcRad" href="#">Add to Total</a>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data: function() {
        return {
            width: 0,
            height: 0,
            diameter: 0,
            radius: 0,
            pie: 3.14, //yummie
            control: ''
        }
    },
    methods: {
        calcSimple() {
            let width = this.width;
            let height = this.height;

            if(this.checkNum(width) && this.checkNum(height)){
                let res = parseFloat(width*height); // calculate result
                this.$emit('calc', res)
                this.width = 0;
                this.height = 0;
            }
            else{
                alert('Please give numeric value');
            }
        },
        calcDiam() {
            let diameter = this.diameter;
            let pie = this.pie;

            if(this.checkNum(diameter)){
                let res = parseFloat(pie*(diameter/2))
                this.$emit('calc', res)
                this.diameter = 0;
            }
            else{
                alert('Please give numeric value');
            }
        },
        calcRad() {
            let radius = this.radius;
            let pie = this.pie;

            if(this.checkNum(radius)){
                let res = parseFloat((pie*(radius*radius))/2); // calculate result
                this.$emit('calc', res)
                this.radius = 0;
            }
            else{
                alert('Please give numeric value');
            }
        },
        checkNum(num) {
            return num && !isNaN(num)
        }
    },
    props: {
        name: String,
    },
    mounted() {
        if (this.name) {
            this.control = this.name
        }
    }
}
</script>

<style>
.selection-wrap {
    display: flex;
    margin: 20px 0;
}
.list-unstyled {
    padding: 0;
    list-style: none;   
}
.selection-item {
    display: block;
    width: 100px;
    height: 100px;
    background: #eaeaea;
    margin: 0 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.control-wrap input {
    padding: 10px;
    border: 2px solid black;
}

.control-wrap input ~ input {
    margin-left: 20px;
}

.control-wrap a {
    display: inline-block;
    color: white;
    background: green;
    padding: 12px 40px;
    margin-left: 20px
}

.selection-item.active {
    background: #c7c7c7;
}

.square span {
    width: 60px;
    height: 40px;
    background: green;
}

.triangle span {
    width: 0;
    height: 0;
    border-bottom: 40px solid green;
    border-right: 60px solid transparent;
}

.circle span {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: green;
}

.arch span {
    width: 50px;
    height: 25px;
    background-color: green;
    border-top-left-radius: 110px;
    border-top-right-radius: 110px;
}
</style>