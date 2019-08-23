<template>
    <div>
        <ul class="selection-wrap list-unstyled">
            <li @click="control = 'simple'" class="selection-item square"><span /></li>
            <li @click="control = 'simple'" class="selection-item triangle"><span /></li>
            <li @click="control = 'diameter'" class="selection-item circle"><span /></li>
            <li @click="control = 'radius'" class="selection-item arch"><span /></li>
        </ul>
        <div class="control-wrap">
            <div v-if="control === 'simple'" class="simple-calc">
                <input name="width" v-model="width" />
                <input name="height" v-model="height" />
                <a @click.prevent="calcSimple" href="#">Add to Total</a>
            </div>
            <div v-if="control === 'diameter'" class="diameter-calc">
                <input name="diameter" v-model="diameter" />
                <a @click.prevent="calcDiam" href="#">Add to Total</a>
            </div>
            <div v-if="control === 'radius'" class="radius-calc">
                <input name="diameter" v-model="diameter" />
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
                this.control = '';
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
                this.control = '';
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
                let res = parseFloat((pie*(rad*rad))/2); // calculate result
                this.$emit('calc', res)
                this.control = '';
                this.radius = 0;
            }
            else{
                alert('Please give numeric value');
            }
        },
        checkNum(num) {
            return num && !isNaN(num)
        }
    }
}
</script>

<style>
.selection-wrap {
    display: flex;
}
.list-unstyled {
    margin: 0;
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
    height: 50px;
    border-radius: 50%;
    background: green;
}

.arch span:after {
    content: '';
    width: 50px;
    height: 30px;
    position: absolute;
    top:50%;
    left: 0;
    right: 0;
    margin: 0 auto;
    background: #eaeaea;
}
</style>