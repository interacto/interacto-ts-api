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

import {TSTransition} from "./TSTransition";
import {InputState} from "../src-core/fsm/InputState";
import {OutputState} from "../src-core/fsm/OutputState";
import {EventRegistrationToken} from "./Events";

/**
 * A transition for a pressure of a key of a keyboard.
 * @author Arnaud BLOUIN
 */
export class KeyPressureTransition extends TSTransition {
    /**
     * Creates the transition.
     */
    public constructor(srcState: OutputState<Event>, tgtState: InputState<Event>) {
        super(srcState, tgtState);
    }

    public accept(event: Event): boolean {
        return event instanceof KeyboardEvent && event.type === EventRegistrationToken.KeyDown;
    }

    public isGuardOK(event: Event): boolean {
        return true;
    }

    public getAcceptedEvents(): Set<string> {
        return new Set([EventRegistrationToken.KeyDown]);
    }
}
