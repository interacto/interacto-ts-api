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
import type {BaseUpdateBinderBuilder} from "./BaseUpdateBinderBuilder";
import type {LogLevel} from "../logging/LogLevel";
import type {Command} from "../command/Command";
import type {InteractionData} from "../interaction/InteractionData";
import type {CmdUpdateBinder} from "./CmdUpdateBinder";
import type {InteractionUpdateBinder} from "./InteractionUpdateBinder";
import type {BaseBinder} from "./BaseBinder";
import type {Interaction} from "../interaction/Interaction";
import type {Widget} from "./BaseBinderBuilder";

/**
 * The base interface for building bindings based on non-trivial user interactions (eg DnD) with routines
 * for defining the UI command and the user interaction to use.
 */
export interface BaseUpdateBinder extends BaseUpdateBinderBuilder, BaseBinder {
    on(widget: ReadonlyArray<Widget<EventTarget>> | Widget<EventTarget>, ...widgets: ReadonlyArray<Widget<EventTarget>>): BaseUpdateBinder;

    onDynamic(node: Widget<Node>): BaseUpdateBinder;

    when(fn: () => boolean): BaseUpdateBinder;

    end(fn: () => void): BaseUpdateBinder;

    log(...level: ReadonlyArray<LogLevel>): BaseUpdateBinder;

    continuousExecution(): BaseUpdateBinder;

    strictStart(): BaseUpdateBinder;

    throttle(timeout: number): BaseUpdateBinder;

    toProduce<C extends Command>(fn: () => C): CmdUpdateBinder<C>;

    usingInteraction<I extends Interaction<D>, D extends InteractionData> (fn: () => I): InteractionUpdateBinder<I, D>;

    stopImmediatePropagation(): BaseUpdateBinder;

    preventDefault(): BaseUpdateBinder;

    catch(fn: (ex: unknown) => void): BaseUpdateBinder;

    name(name: string): BaseUpdateBinder;
}
