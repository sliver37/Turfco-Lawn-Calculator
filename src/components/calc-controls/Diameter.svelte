<div class="flex items-center diameter-calc">
    <input name="diameter" placeholder="Diameter" bind:value="{diameter}" />
    <a class="button" on:click|preventDefault="{calcDiam}" href="#">Add to Total</a>
</div>

<script>
import {createEventDispatcher} from 'svelte'
import { checkNum } from '../functions/checkNumber'
    
    const dispatch = createEventDispatcher()

    export let shape

    let diameter = null

    const calcDiam = () => {

        if(checkNum(diameter)){
            let res = (Math.PI * (diameter/2)).toFixed(1);
            dispatch('calc', res)
        }
        else{
            alert('Please give numeric value')
        }
    }

</script>