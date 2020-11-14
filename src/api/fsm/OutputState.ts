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

import {State} from "./State";
import {Transition} from "./Transition";

/**
 * Defines a type of state that can produce as output events.
 * @typeParam E - The type of events the FSM processes.
 */
export interface OutputState extends State {
    /**
     * Actions done when a transition of the state is executed so
     * that this state is left.
     * @throws CancelFSMException If leaving the state leads to a cancelling of the FSM execution.
     */
    exit(): void;

    /**
     * Asks to the state to process of the given event.
     * @param event - The event to process. Can be null.
     */
    process(event: Event): boolean;

    /**
     * @returns The list of outgoing transitions of the state.
     */
    getTransitions(): Array<Transition<Event>>;

    /**
     * Adds the given transitions to the list of outgoing transitions of the state.
     * @param tr - The transition to add.
     */
    addTransition(tr: Transition<Event>): void;
}

export function isOutputStateType(obj: State | undefined): obj is OutputState {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (obj as OutputState).exit !== undefined && (obj as OutputState).addTransition !== undefined &&
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (obj as OutputState).process !== undefined && (obj as OutputState).getTransitions !== undefined;
}
