<template>
  <div id="app">
    <div class="calculator-wrap">
      <div class="block-wrap" v-for="(calcblock, index) in calcblocks" :key="calcblock.name">
        <a href="#" @click.prevent="removeShape(index)">Remove Shape</a> 
        <calc-block @calc="calc" :index="index" />        
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
        { name: "first" },
        { name: "second" },
        { name: "third" },
        { name: "fourth" }
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
</style>
