<template>
  <div id="app">
    <div class="calculator-wrap">
      <div class="block-wrap" v-for="(calcblock, index) in calcblocks" :key="calcblock.name">
        <a href="#" @click.prevent="removeShape(index)">Remove Shape</a> 
        <calc-block @calc="calc" :name="calcblock.default" />        
      </div>
      <input disabled class="total" v-model="total" />
      <a href="#" @click.prevent="addShape">Add Shape</a>
    </div>    
  </div>
</template>

<script>
import CalcBlock from './components/CalcBlock.vue'

export default {
  name: 'app',
  data: function() {
    return {
      total: 100,
      calcblocks: [
        { name: "first", default: 'square' },
        { name: "second", default: 'triangle' },
        { name: "third", default: 'circle' },
        { name: "fourth", default: 'arch' }
      ]
    }
  },
  components: {
    CalcBlock
  },
  methods: {
    addShape() {
      this.calcblocks.push({
        name: 'extra'
      })
    },
    removeShape(index) {
      this.calcblocks.splice(index, 1)
    },
    getTotal() {
      return this.total;
    },
    setTotal(calc) {
      this.total += calc;
    },
    calc(val) {
      this.total += val
    }
  },
  provide: function() {
    return {
      getTotal: this.getTotal,
      setTotal: this.setTotal,
    }
  },
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.total {
  font-size: 20px;
  padding: 2rem;
  background: red;
}

.calculator-wrap {
    max-width: 1170px;
    margin: 0 auto;  
}

.block-wrap {
  padding: 20px;
  align-items: center;
  display: flex;
  flex-direction: column;
}
</style>
