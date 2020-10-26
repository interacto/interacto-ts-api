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

import {OutputState} from "../../api/fsm/OutputState";
import {InputState} from "../../api/fsm/InputState";
import {EventRegistrationToken, isButton} from "./Events";
import {TransitionBase} from "./TransitionBase";

/**
 * An FSM transition for the Button HTML element.
 * @author Arnaud BLOUIN
 */
export class ButtonPressedTransition extends TransitionBase {

    /**
     * Creates the transition.
     */
    public constructor(srcState: OutputState, tgtState: InputState) {
        super(srcState, tgtState);
    }

    public accept(e: Event): boolean {
        return e.target !== null && isButton(e.target);
    }

    public getAcceptedEvents(): Set<string> {
        return new Set([EventRegistrationToken.click, EventRegistrationToken.auxclick]);
    }

    public isGuardOK(_event: Event): boolean {
        return true;
    }
}