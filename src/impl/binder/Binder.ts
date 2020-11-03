/*
 * This file is part of Interacto.
 * Interacto is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Interacto is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with Interacto.  If not, see <https://www.gnu.org/licenses/>.
 */

import {LogLevel} from "../../api/logging/LogLevel";
import {InteractionData} from "../../api/interaction/InteractionData";
import {Command} from "../../api/command/Command";
import {CmdBinder} from "../../api/binder/CmdBinder";
import {InteractionBinder} from "../../api/binder/InteractionBinder";
import {InteractionCmdBinder} from "../../api/binder/InteractionCmdBinder";
import {Binding} from "../../api/binding/Binding";
import {BindingsObserver} from "../../api/binding/BindingsObserver";
import {Interaction} from "../../api/interaction/Interaction";

/**
 * The base class that defines the concept of binding builder (called binder).
 * @param <C> The type of the action to produce.
 * @param <I> The type of the user interaction to bind.
 * @author Arnaud Blouin
 */
export abstract class Binder<C extends Command, I extends Interaction<D>, D extends InteractionData>
implements CmdBinder<C>, InteractionBinder<I, D>, InteractionCmdBinder<C, I, D> {

    protected initCmd?: (c: C, i: D) => void;

    protected checkConditions?: (i: D) => boolean;

    protected cmdProducer?: (i: D) => C;

    protected widgets: Array<EventTarget>;

    protected dynamicNodes: Array<Node>;

    protected interactionSupplier?: () => I;

    protected hadEffectsFct?: (c: C, i: D) => void;

    protected hadNoEffectFct?: (c: C, i: D) => void;

    protected cannotExecFct?: (c: C, i: D) => void;

    protected onEnd?: (c: C, i: D) => void;

    protected logLevels: Array<LogLevel>;

    protected stopPropaNow: boolean;

    protected prevDef: boolean;

    protected observer?: BindingsObserver;


    protected constructor(observer?: BindingsObserver, initCmd?: (c: C, i: D) => void, checkConditions?: (i: D) => boolean,
                          cmdProducer?: (i: D) => C, widgets?: Array<EventTarget>, dynamicNodes?: Array<Node>,
                          interactionSupplier?: () => I, onEnd?: (c: C, i: D) => void,
                          logLevels?: Array<LogLevel>, hadNoEffectFct?: (c: C, i: D) => void, hadEffectsFct?: (c: C, i: D) => void,
                          cannotExecFct?: (c: C, i: D) => void, stopProga?: boolean, prevent?: boolean) {
        this.initCmd = initCmd;
        this.checkConditions = checkConditions;
        this.cmdProducer = cmdProducer;
        this.widgets = widgets ?? [];
        this.dynamicNodes = dynamicNodes ?? [];
        this.interactionSupplier = interactionSupplier;
        this.onEnd = onEnd;
        this.hadEffectsFct = hadEffectsFct;
        this.hadNoEffectFct = hadNoEffectFct;
        this.cannotExecFct = cannotExecFct;
        this.logLevels = logLevels ?? [];
        this.stopPropaNow = stopProga ?? false;
        this.prevDef = prevent ?? false;
        this.observer = observer;
    }

    protected abstract duplicate(): Binder<C, I, D>;

    public on(...widget: Array<EventTarget>): Binder<C, I, D> {
        const w: Array<EventTarget> = this.widgets.length === 0 ? widget : [...this.widgets].concat(widget);
        const dup = this.duplicate();
        dup.widgets = w;
        return dup;
    }

    public onDynamic(node: Node): Binder<C, I, D> {
        const dup = this.duplicate();
        dup.dynamicNodes = [...this.dynamicNodes].concat(node);
        return dup;
    }

    public first(initCmdFct: (c: C, i: D) => void): Binder<C, I, D> {
        const dup = this.duplicate();
        dup.initCmd = initCmdFct;
        return dup;
    }

    public when(checkCmd: (i: D) => boolean): Binder<C, I, D> {
        const dup = this.duplicate();
        dup.checkConditions = checkCmd;
        return dup;
    }

    public ifHadEffects(hadEffectFct: (c: C, i: D) => void): Binder<C, I, D> {
        const dup = this.duplicate();
        dup.hadEffectsFct = hadEffectFct;
        return dup;
    }

    public ifHadNoEffect(noEffectFct: (c: C, i: D) => void): Binder<C, I, D> {
        const dup = this.duplicate();
        dup.hadNoEffectFct = noEffectFct;
        return dup;
    }

    public ifCannotExecute(cannotExec: (c: C, i: D) => void): Binder<C, I, D> {
        const dup = this.duplicate();
        dup.cannotExecFct = cannotExec;
        return dup;
    }

    public end(onEndFct: (c: C, i: D) => void): Binder<C, I, D> {
        const dup = this.duplicate();
        dup.onEnd = onEndFct;
        return dup;
    }

    public log(...level: Array<LogLevel>): Binder<C, I, D> {
        const dup = this.duplicate();
        dup.logLevels = [...level];
        return dup;
    }

    public stopImmediatePropagation(): Binder<C, I, D> {
        const dup = this.duplicate();
        dup.stopPropaNow = true;
        return dup;
    }

    public preventDefault(): Binder<C, I, D> {
        const dup = this.duplicate();
        dup.prevDef = true;
        return dup;
    }

    public usingInteraction<I2 extends Interaction<D2>, D2 extends InteractionData>
    (interactionSupplier: () => I2): Binder<C, I2, D2> {
        const dup = this.duplicate();
        dup.interactionSupplier = interactionSupplier as unknown as () => I;
        return dup as unknown as Binder<C, I2, D2>;
    }

    public toProduce<C2 extends Command>(cmdCreation: (i: D) => C2): Binder<C2, I, D> {
        const dup = this.duplicate();
        dup.cmdProducer = cmdCreation as unknown as (i: D) => C;
        return dup as unknown as Binder<C2, I, D>;
    }

    public abstract bind(): Binding<C, I, D>;
}
