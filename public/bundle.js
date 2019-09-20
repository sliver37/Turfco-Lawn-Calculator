
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = current_component;
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, changed, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(changed, child_ctx);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const checkNum = (num) => {
        console.log(num);
        return num && !isNaN(num)
    };

    /* src\components\calc-controls\Simple.svelte generated by Svelte v3.9.1 */
    const { console: console_1 } = globals;

    const file = "src\\components\\calc-controls\\Simple.svelte";

    function create_fragment(ctx) {
    	var div, input0, t0, span, i, t1, input1, t2, a, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			input0 = element("input");
    			t0 = space();
    			span = element("span");
    			i = element("i");
    			t1 = space();
    			input1 = element("input");
    			t2 = space();
    			a = element("a");
    			a.textContent = "Add to Total";
    			attr(input0, "name", "width");
    			attr(input0, "placeholder", "Width");
    			add_location(input0, file, 1, 4, 49);
    			attr(i, "class", "fas fa-times");
    			add_location(i, file, 2, 26, 140);
    			attr(span, "class", "divider svelte-vyb9sk");
    			add_location(span, file, 2, 4, 118);
    			attr(input1, "name", "height");
    			attr(input1, "placeholder", "Height");
    			add_location(input1, file, 3, 4, 181);
    			attr(a, "class", "button");
    			attr(a, "href", "#");
    			add_location(a, file, 4, 4, 253);
    			attr(div, "class", "flex items-center simple-calc svelte-vyb9sk");
    			add_location(div, file, 0, 0, 0);

    			dispose = [
    				listen(input0, "input", ctx.input0_input_handler),
    				listen(input1, "input", ctx.input1_input_handler),
    				listen(a, "click", prevent_default(ctx.calcSimple))
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, input0);

    			set_input_value(input0, ctx.width);

    			append(div, t0);
    			append(div, span);
    			append(span, i);
    			append(div, t1);
    			append(div, input1);

    			set_input_value(input1, ctx.height);

    			append(div, t2);
    			append(div, a);
    		},

    		p: function update(changed, ctx) {
    			if (changed.width && (input0.value !== ctx.width)) set_input_value(input0, ctx.width);
    			if (changed.height && (input1.value !== ctx.height)) set_input_value(input1, ctx.height);
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	
        
        const dispatch = createEventDispatcher();

        let { shape } = $$props;

        let width = null;
        let height = null;

        const calcSimple = () => {

            if(checkNum(width) && checkNum(height)){
                console.log(shape);
                let res = (width*height); // calculate result
                res = shape.name === 'triangle' ? res/2 : res;
                res = res.toFixed(1);

                dispatch('calc', res);
            }
            else{
                alert('Please give numeric value');
            }
        };

    	const writable_props = ['shape'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console_1.warn(`<Simple> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		width = this.value;
    		$$invalidate('width', width);
    	}

    	function input1_input_handler() {
    		height = this.value;
    		$$invalidate('height', height);
    	}

    	$$self.$set = $$props => {
    		if ('shape' in $$props) $$invalidate('shape', shape = $$props.shape);
    	};

    	return {
    		shape,
    		width,
    		height,
    		calcSimple,
    		input0_input_handler,
    		input1_input_handler
    	};
    }

    class Simple extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["shape"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.shape === undefined && !('shape' in props)) {
    			console_1.warn("<Simple> was created without expected prop 'shape'");
    		}
    	}

    	get shape() {
    		throw new Error("<Simple>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shape(value) {
    		throw new Error("<Simple>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\calc-controls\Diameter.svelte generated by Svelte v3.9.1 */

    const file$1 = "src\\components\\calc-controls\\Diameter.svelte";

    function create_fragment$1(ctx) {
    	var div, input, t, a, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t = space();
    			a = element("a");
    			a.textContent = "Add to Total";
    			attr(input, "name", "diameter");
    			attr(input, "placeholder", "Diameter");
    			add_location(input, file$1, 1, 4, 51);
    			attr(a, "class", "button");
    			attr(a, "href", "#");
    			add_location(a, file$1, 2, 4, 129);
    			attr(div, "class", "flex items-center diameter-calc");
    			add_location(div, file$1, 0, 0, 0);

    			dispose = [
    				listen(input, "input", ctx.input_input_handler),
    				listen(a, "click", prevent_default(ctx.calcDiam))
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, input);

    			set_input_value(input, ctx.diameter);

    			append(div, t);
    			append(div, a);
    		},

    		p: function update(changed, ctx) {
    			if (changed.diameter && (input.value !== ctx.diameter)) set_input_value(input, ctx.diameter);
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	
        
        const dispatch = createEventDispatcher();

        let { shape } = $$props;

        let diameter = null;

        const calcDiam = () => {

            if(checkNum(diameter)){
                let res = (Math.PI * (diameter/2)).toFixed(1);
                dispatch('calc', res);
            }
            else{
                alert('Please give numeric value');
            }
        };

    	const writable_props = ['shape'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Diameter> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		diameter = this.value;
    		$$invalidate('diameter', diameter);
    	}

    	$$self.$set = $$props => {
    		if ('shape' in $$props) $$invalidate('shape', shape = $$props.shape);
    	};

    	return {
    		shape,
    		diameter,
    		calcDiam,
    		input_input_handler
    	};
    }

    class Diameter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["shape"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.shape === undefined && !('shape' in props)) {
    			console.warn("<Diameter> was created without expected prop 'shape'");
    		}
    	}

    	get shape() {
    		throw new Error("<Diameter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shape(value) {
    		throw new Error("<Diameter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\calc-controls\Radius.svelte generated by Svelte v3.9.1 */

    const file$2 = "src\\components\\calc-controls\\Radius.svelte";

    function create_fragment$2(ctx) {
    	var div, input, t, a, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t = space();
    			a = element("a");
    			a.textContent = "Add to Total";
    			attr(input, "name", "radius");
    			attr(input, "placeholder", "Radius");
    			add_location(input, file$2, 1, 4, 49);
    			attr(a, "class", "button");
    			attr(a, "href", "#");
    			add_location(a, file$2, 2, 4, 121);
    			attr(div, "class", "flex items-center radius-calc");
    			add_location(div, file$2, 0, 0, 0);

    			dispose = [
    				listen(input, "input", ctx.input_input_handler),
    				listen(a, "click", prevent_default(ctx.calcRad))
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, input);

    			set_input_value(input, ctx.radius);

    			append(div, t);
    			append(div, a);
    		},

    		p: function update(changed, ctx) {
    			if (changed.radius && (input.value !== ctx.radius)) set_input_value(input, ctx.radius);
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	
        
        const dispatch = createEventDispatcher();

        let { shape } = $$props;

        let radius = null;

        const calcRad = () => {
            if(checkNum(radius)){
                let res = ((Math.PI * (radius*radius))/2).toFixed(1);
                dispatch('calc', res);
            } else{
                alert('Please give numeric value');
            }
        };

    	const writable_props = ['shape'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Radius> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		radius = this.value;
    		$$invalidate('radius', radius);
    	}

    	$$self.$set = $$props => {
    		if ('shape' in $$props) $$invalidate('shape', shape = $$props.shape);
    	};

    	return {
    		shape,
    		radius,
    		calcRad,
    		input_input_handler
    	};
    }

    class Radius extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["shape"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.shape === undefined && !('shape' in props)) {
    			console.warn("<Radius> was created without expected prop 'shape'");
    		}
    	}

    	get shape() {
    		throw new Error("<Radius>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shape(value) {
    		throw new Error("<Radius>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\CalcBlock.svelte generated by Svelte v3.9.1 */

    const file$3 = "src\\components\\CalcBlock.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.shape = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.shape = list[i];
    	return child_ctx;
    }

    // (2:147) {#if totalShapeCount > 1}
    function create_if_block_2(ctx) {
    	var a, dispose;

    	return {
    		c: function create() {
    			a = element("a");
    			a.textContent = "X";
    			attr(a, "class", "delete-shape svelte-1hkggpr");
    			attr(a, "href", "#");
    			add_location(a, file$3, 1, 172, 194);
    			dispose = listen(a, "click", prevent_default(ctx.removeShape));
    		},

    		m: function mount(target, anchor) {
    			insert(target, a, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(a);
    			}

    			dispose();
    		}
    	};
    }

    // (5:8) {#each shapes as shape (shape.name)}
    function create_each_block_1(key_1, ctx) {
    	var li, div, span, t, li_class_value, dispose;

    	function click_handler() {
    		return ctx.click_handler(ctx);
    	}

    	return {
    		key: key_1,

    		first: null,

    		c: function create() {
    			li = element("li");
    			div = element("div");
    			span = element("span");
    			t = space();
    			attr(span, "class", "svelte-1hkggpr");
    			add_location(span, file$3, 7, 20, 595);
    			attr(div, "class", "shape-inner svelte-1hkggpr");
    			add_location(div, file$3, 6, 16, 548);
    			attr(li, "class", li_class_value = "selection-item " + ctx.shape.name + " " + (ctx.control === ctx.shape.name ? 'active' : '') + " svelte-1hkggpr");
    			add_location(li, file$3, 5, 12, 392);
    			dispose = listen(li, "click", prevent_default(click_handler));
    			this.first = li;
    		},

    		m: function mount(target, anchor) {
    			insert(target, li, anchor);
    			append(li, div);
    			append(div, span);
    			append(li, t);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.control) && li_class_value !== (li_class_value = "selection-item " + ctx.shape.name + " " + (ctx.control === ctx.shape.name ? 'active' : '') + " svelte-1hkggpr")) {
    				attr(li, "class", li_class_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(li);
    			}

    			dispose();
    		}
    	};
    }

    // (17:12) {#if shape.name === control && !localTotal}
    function create_if_block_1(ctx) {
    	var switch_instance_anchor, current;

    	var switch_value = ctx.shape.controls;

    	function switch_props(ctx) {
    		return {
    			props: { shape: "control" },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    		switch_instance.$on("calc", ctx.controlCalc);
    	}

    	return {
    		c: function create() {
    			if (switch_instance) switch_instance.$$.fragment.c();
    			switch_instance_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (switch_value !== (switch_value = ctx.shape.controls)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("calc", ctx.controlCalc);

    					switch_instance.$$.fragment.c();
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(switch_instance_anchor);
    			}

    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    }

    // (16:8) {#each shapes as shape (blockid + shape.name)}
    function create_each_block(key_1, ctx) {
    	var first, if_block_anchor, current;

    	var if_block = (ctx.shape.name === ctx.control && !ctx.localTotal) && create_if_block_1(ctx);

    	return {
    		key: key_1,

    		first: null,

    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},

    		m: function mount(target, anchor) {
    			insert(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.shape.name === ctx.control && !ctx.localTotal) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(first);
    			}

    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    // (22:8) {#if localTotal}
    function create_if_block(ctx) {
    	var div, span, t0, t1, sup, t3, a, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text(ctx.localTotal);
    			t1 = text("m");
    			sup = element("sup");
    			sup.textContent = "2";
    			t3 = space();
    			a = element("a");
    			a.textContent = "Re-calculate";
    			add_location(sup, file$3, 23, 72, 1125);
    			attr(span, "class", "local-total total__value-box svelte-1hkggpr");
    			add_location(span, file$3, 23, 16, 1069);
    			attr(a, "class", "button svelte-1hkggpr");
    			attr(a, "href", "#");
    			add_location(a, file$3, 24, 16, 1162);
    			attr(div, "v-if", "localTotal");
    			attr(div, "class", "flex items-center totalBar svelte-1hkggpr");
    			add_location(div, file$3, 22, 12, 993);
    			dispose = listen(a, "click", prevent_default(ctx.reCalc));
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, span);
    			append(span, t0);
    			append(span, t1);
    			append(span, sup);
    			append(div, t3);
    			append(div, a);
    		},

    		p: function update(changed, ctx) {
    			if (changed.localTotal) {
    				set_data(t0, ctx.localTotal);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			dispose();
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	var div1, h2, span0, t0, t1, span1, t2, t3, t4, t5, t6, ul, each_blocks_1 = [], each0_lookup = new Map(), t7, div0, each_blocks = [], each1_lookup = new Map(), t8, current;

    	var if_block0 = (ctx.totalShapeCount > 1) && create_if_block_2(ctx);

    	var each_value_1 = ctx.shapes;

    	const get_key = ctx => ctx.shape.name;

    	for (var i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
    	}

    	var each_value = ctx.shapes;

    	const get_key_1 = ctx => ctx.blockid + ctx.shape.name;

    	for (var i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	var if_block1 = (ctx.localTotal) && create_if_block(ctx);

    	return {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			span0 = element("span");
    			t0 = text(ctx.stepNumber);
    			t1 = text(".");
    			span1 = element("span");
    			t2 = text("Choose your ");
    			t3 = text(ctx.name);
    			t4 = text(" shape to calculate.");
    			t5 = space();
    			if (if_block0) if_block0.c();
    			t6 = space();
    			ul = element("ul");

    			for (i = 0; i < each_blocks_1.length; i += 1) each_blocks_1[i].c();

    			t7 = space();
    			div0 = element("div");

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();

    			t8 = space();
    			if (if_block1) if_block1.c();
    			attr(span0, "class", "step-number svelte-1hkggpr");
    			add_location(span0, file$3, 1, 31, 53);
    			attr(span1, "class", "step-text svelte-1hkggpr");
    			add_location(span1, file$3, 1, 77, 99);
    			attr(h2, "class", "flex items-center");
    			add_location(h2, file$3, 1, 1, 23);
    			attr(ul, "class", "selection-wrap list-unstyled svelte-1hkggpr");
    			add_location(ul, file$3, 3, 4, 291);
    			attr(div0, "class", "control-wrap svelte-1hkggpr");
    			add_location(div0, file$3, 13, 4, 679);
    			attr(div1, "class", "w-full svelte-1hkggpr");
    			add_location(div1, file$3, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, h2);
    			append(h2, span0);
    			append(span0, t0);
    			append(span0, t1);
    			append(h2, span1);
    			append(span1, t2);
    			append(span1, t3);
    			append(span1, t4);
    			append(h2, t5);
    			if (if_block0) if_block0.m(h2, null);
    			append(div1, t6);
    			append(div1, ul);

    			for (i = 0; i < each_blocks_1.length; i += 1) each_blocks_1[i].m(ul, null);

    			append(div1, t7);
    			append(div1, div0);

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(div0, null);

    			append(div0, t8);
    			if (if_block1) if_block1.m(div0, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!current || changed.stepNumber) {
    				set_data(t0, ctx.stepNumber);
    			}

    			if (!current || changed.name) {
    				set_data(t3, ctx.name);
    			}

    			if (ctx.totalShapeCount > 1) {
    				if (!if_block0) {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(h2, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			const each_value_1 = ctx.shapes;
    			each_blocks_1 = update_keyed_each(each_blocks_1, changed, get_key, 1, ctx, each_value_1, each0_lookup, ul, destroy_block, create_each_block_1, null, get_each_context_1);

    			const each_value = ctx.shapes;

    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, changed, get_key_1, 1, ctx, each_value, each1_lookup, div0, outro_and_destroy_block, create_each_block, t8, get_each_context);
    			check_outros();

    			if (ctx.localTotal) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			for (i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			if (if_block0) if_block0.d();

    			for (i = 0; i < each_blocks_1.length; i += 1) each_blocks_1[i].d();

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();

    			if (if_block1) if_block1.d();
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	
        
        const dispatch = createEventDispatcher();
        let { blockid, name, defaultShape, totalShapeCount } = $$props;

        let shapes = [
            {
                name: 'square',
                controls: Simple
            },
            {
                name: 'triangle',
                controls: Simple
            },
            {
                name: 'circle',
                controls: Diameter
            },
            {
                name: 'arch',
                controls: Radius
            },
        ];

        let localTotal = 0;

        const controlCalc = (res) => {
            $$invalidate('localTotal', localTotal = res.detail);
            return dispatch('calc', localTotal)
        };

        const reCalc = () => {
            dispatch('recalc', localTotal);
            $$invalidate('localTotal', localTotal = 0);
        };

        const removeShape = () => {
            let prompt = window.confirm(`Are you sure you want to remove shape ${stepNumber}?`);         
            
            if (prompt) {
                reCalc();
                dispatch('removeshape');    
            }    
        };

        let control = '';
        const changeSelection = (shape) => {
            if (localTotal) {
                let prompt = window.confirm('Are you sure? This will remove this shapes calculation');        
                if (prompt) {
                    $$invalidate('control', control = shape.name);
                    reCalc();
                    width = null;
                    height = null;
                    diameter = null;
                    radius = null;
                } 
            } else {
                $$invalidate('control', control = shape.name);   
            }  
                        
        }; 

        onMount(() => {
            if (name) {
                $$invalidate('control', control = defaultShape);
            }
        });

    	const writable_props = ['blockid', 'name', 'defaultShape', 'totalShapeCount'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<CalcBlock> was created with unknown prop '${key}'`);
    	});

    	function click_handler({ shape }) {
    		return changeSelection(shape);
    	}

    	$$self.$set = $$props => {
    		if ('blockid' in $$props) $$invalidate('blockid', blockid = $$props.blockid);
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    		if ('defaultShape' in $$props) $$invalidate('defaultShape', defaultShape = $$props.defaultShape);
    		if ('totalShapeCount' in $$props) $$invalidate('totalShapeCount', totalShapeCount = $$props.totalShapeCount);
    	};

    	let stepNumber;

    	$$self.$$.update = ($$dirty = { name: 1 }) => {
    		if ($$dirty.name) { $$invalidate('stepNumber', stepNumber = parseInt(name)); }
    	};

    	return {
    		blockid,
    		name,
    		defaultShape,
    		totalShapeCount,
    		shapes,
    		localTotal,
    		controlCalc,
    		reCalc,
    		removeShape,
    		control,
    		changeSelection,
    		stepNumber,
    		click_handler
    	};
    }

    class CalcBlock extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["blockid", "name", "defaultShape", "totalShapeCount"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.blockid === undefined && !('blockid' in props)) {
    			console.warn("<CalcBlock> was created without expected prop 'blockid'");
    		}
    		if (ctx.name === undefined && !('name' in props)) {
    			console.warn("<CalcBlock> was created without expected prop 'name'");
    		}
    		if (ctx.defaultShape === undefined && !('defaultShape' in props)) {
    			console.warn("<CalcBlock> was created without expected prop 'defaultShape'");
    		}
    		if (ctx.totalShapeCount === undefined && !('totalShapeCount' in props)) {
    			console.warn("<CalcBlock> was created without expected prop 'totalShapeCount'");
    		}
    	}

    	get blockid() {
    		throw new Error("<CalcBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set blockid(value) {
    		throw new Error("<CalcBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<CalcBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<CalcBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get defaultShape() {
    		throw new Error("<CalcBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set defaultShape(value) {
    		throw new Error("<CalcBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get totalShapeCount() {
    		throw new Error("<CalcBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set totalShapeCount(value) {
    		throw new Error("<CalcBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const generateUID = () => {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        )
    };

    const suffixNum = (i) => {
        var j = i % 10,
            k = i % 100;
        if (j == 1 && k != 11) {
            return i + "st";
        }
        if (j == 2 && k != 12) {
            return i + "nd";
        }
        if (j == 3 && k != 13) {
            return i + "rd";
        }
        return i + "th";
    };

    /* src\App.svelte generated by Svelte v3.9.1 */

    const file$4 = "src\\App.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.calcblock = list[i];
    	child_ctx.index = i;
    	return child_ctx;
    }

    // (3:2) {#each calcblocks as calcblock, index (calcblock.id)}
    function create_each_block$1(key_1, ctx) {
    	var div, current;

    	function removeshape_handler() {
    		return ctx.removeshape_handler(ctx);
    	}

    	var calcblock = new CalcBlock({
    		props: {
    		blockid: ctx.calcblock.id,
    		name: suffixNum(ctx.index+1),
    		totalShapeCount: ctx.calcblocks.length,
    		defaultShape: ctx.calcblock.default
    	},
    		$$inline: true
    	});
    	calcblock.$on("calc", ctx.calc);
    	calcblock.$on("recalc", ctx.reCalc);
    	calcblock.$on("removeshape", removeshape_handler);

    	return {
    		key: key_1,

    		first: null,

    		c: function create() {
    			div = element("div");
    			calcblock.$$.fragment.c();
    			attr(div, "class", "block-wrap svelte-ri8oqa");
    			add_location(div, file$4, 3, 3, 119);
    			this.first = div;
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(calcblock, div, null);
    			current = true;
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			var calcblock_changes = {};
    			if (changed.calcblocks) calcblock_changes.blockid = ctx.calcblock.id;
    			if (changed.suffixNum || changed.calcblocks) calcblock_changes.name = suffixNum(ctx.index+1);
    			if (changed.calcblocks) calcblock_changes.totalShapeCount = ctx.calcblocks.length;
    			if (changed.calcblocks) calcblock_changes.defaultShape = ctx.calcblock.default;
    			calcblock.$set(calcblock_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(calcblock.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(calcblock.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(calcblock);
    		}
    	};
    }

    function create_fragment$4(ctx) {
    	var div4, div0, each_blocks = [], each_1_lookup = new Map(), t0, a0, t1, i, t2, div3, div2, span0, t4, div1, span1, t6, span2, t7, t8, span3, t9, sup, t11, a1, t12, current, dispose;

    	var each_value = ctx.calcblocks;

    	const get_key = ctx => ctx.calcblock.id;

    	for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i_1);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i_1] = create_each_block$1(key, child_ctx));
    	}

    	return {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");

    			for (i_1 = 0; i_1 < each_blocks.length; i_1 += 1) each_blocks[i_1].c();

    			t0 = space();
    			a0 = element("a");
    			t1 = text("Add another shape ");
    			i = element("i");
    			t2 = space();
    			div3 = element("div");
    			div2 = element("div");
    			span0 = element("span");
    			span0.textContent = "=";
    			t4 = space();
    			div1 = element("div");
    			span1 = element("span");
    			span1.textContent = "Total";
    			t6 = space();
    			span2 = element("span");
    			t7 = text(ctx.total);
    			t8 = space();
    			span3 = element("span");
    			t9 = text("m");
    			sup = element("sup");
    			sup.textContent = "2";
    			t11 = space();
    			a1 = element("a");
    			t12 = text("Buy Turf Online");
    			attr(i, "class", "text-black fas fa-plus");
    			add_location(i, file$4, 8, 102, 498);
    			attr(a0, "class", "button button__add-shape");
    			attr(a0, "href", "#");
    			add_location(a0, file$4, 8, 2, 398);
    			attr(div0, "class", "calculator-wrap svelte-ri8oqa");
    			add_location(div0, file$4, 1, 1, 28);
    			attr(span0, "class", "total__equals svelte-ri8oqa");
    			add_location(span0, file$4, 12, 4, 645);
    			attr(span1, "class", "total__text flex-grow-1 svelte-ri8oqa");
    			add_location(span1, file$4, 14, 5, 777);
    			attr(span2, "class", "total__value svelte-ri8oqa");
    			add_location(span2, file$4, 15, 5, 834);
    			attr(div1, "class", "flex items-center total__value-box total__value-box--main flex-grow-1 svelte-ri8oqa");
    			add_location(div1, file$4, 13, 4, 687);
    			add_location(sup, file$4, 17, 33, 926);
    			attr(span3, "class", "total__metric");
    			add_location(span3, file$4, 17, 4, 897);
    			attr(div2, "class", "flex items-center total svelte-ri8oqa");
    			add_location(div2, file$4, 11, 3, 602);
    			attr(a1, "class", "et_pb_button");
    			attr(a1, "href", ctx.dataUrl);
    			add_location(a1, file$4, 19, 3, 961);
    			attr(div3, "class", "flex items-center total-wrapper svelte-ri8oqa");
    			add_location(div3, file$4, 10, 1, 552);
    			attr(div4, "id", "app-calculator");
    			attr(div4, "class", "svelte-ri8oqa");
    			add_location(div4, file$4, 0, 0, 0);
    			dispose = listen(a0, "click", prevent_default(ctx.addShape));
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div4, anchor);
    			append(div4, div0);

    			for (i_1 = 0; i_1 < each_blocks.length; i_1 += 1) each_blocks[i_1].m(div0, null);

    			append(div0, t0);
    			append(div0, a0);
    			append(a0, t1);
    			append(a0, i);
    			append(div4, t2);
    			append(div4, div3);
    			append(div3, div2);
    			append(div2, span0);
    			append(div2, t4);
    			append(div2, div1);
    			append(div1, span1);
    			append(div1, t6);
    			append(div1, span2);
    			append(span2, t7);
    			append(div2, t8);
    			append(div2, span3);
    			append(span3, t9);
    			append(span3, sup);
    			append(div3, t11);
    			append(div3, a1);
    			append(a1, t12);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			const each_value = ctx.calcblocks;

    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, div0, outro_and_destroy_block, create_each_block$1, t0, get_each_context$1);
    			check_outros();

    			if (!current || changed.total) {
    				set_data(t7, ctx.total);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) transition_in(each_blocks[i_1]);

    			current = true;
    		},

    		o: function outro(local) {
    			for (i_1 = 0; i_1 < each_blocks.length; i_1 += 1) transition_out(each_blocks[i_1]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div4);
    			}

    			for (i_1 = 0; i_1 < each_blocks.length; i_1 += 1) each_blocks[i_1].d();

    			dispose();
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	

    	let total = 0;

    	let dataUrl = document.getElementById('lawn-calculator').getAttribute('data-url');
    	
    	const addShape = () => {
    		let newBlock = {
    			id: generateUID(),
    			default: 'square'
    		};
    		$$invalidate('calcblocks', calcblocks = [...calcblocks, newBlock]);
    	};
    	
        const removeShape = (index) => {
          	$$invalidate('calcblocks', calcblocks = calcblocks.filter((calcblock, i) => i !== index));
    	};
    	
        const calc = (e) => {
    		let result = parseFloat(e.detail);
          	$$invalidate('total', total += result);
    	};
    	
        const reCalc = (e) => {
    		let result = parseFloat(e.detail);
          	$$invalidate('total', total -= result);
    	};

    	function removeshape_handler({ index }) {
    		return removeShape(index);
    	}

    	let calcblocks;

    	$$invalidate('calcblocks', calcblocks = [
    				{ id: generateUID(), default: 'square' },
    			]);

    	return {
    		total,
    		dataUrl,
    		addShape,
    		removeShape,
    		calc,
    		reCalc,
    		calcblocks,
    		removeshape_handler
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, []);
    	}
    }

    let target = document.getElementById('lawn-calculator');

    var app = new App({
    	target: target 
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
