/*
 * This file is part of Interacto.
 * Interacto is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General export function License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Interacto is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General export function License for more details.
 * You should have received a copy of the GNU General export function License
 * along with Interacto.  If not, see <https://www.gnu.org/licenses/>.
 */

import { CmdBinder } from "./api/CmdBinder";
import { AnonCmd } from "../command/AnonCmd";
import { AnonCmdBinder } from "./AnonCmdBinder";
import { InteractionBinder } from "./api/InteractionBinder";
import { ButtonPressed } from "../interaction/library/ButtonPressed";
import { WidgetData } from "../interaction/WidgetData";
import { Command } from "../command/Command";
import { UpdateBinder } from "./UpdateBinder";
import { BoxChecked } from "../interaction/library/BoxChecked";
import { ColorPicked } from "../interaction/library/ColorPicked";
import { ComboBoxSelected } from "../interaction/library/ComboBoxSelected";
import { SpinnerChanged } from "../interaction/library/SpinnerChanged";
import { InteractionUpdateBinder } from "./api/InteractionUpdateBinder";
import { DatePicked } from "../interaction/library/DatePicked";
import { InteractionImpl } from "../interaction/InteractionImpl";
import { InteractionData } from "../interaction/InteractionData";
import { FSM } from "../fsm/FSM";
import { CommandImpl } from "../command/CommandImpl";
import { BaseUpdateBinder } from "./api/BaseUpdateBinder";


export function nodeBinder(): BaseUpdateBinder {
    return new UpdateBinder<CommandImpl, InteractionImpl<InteractionData, FSM, {}>, InteractionData>(0, false, false) as BaseUpdateBinder;
}

/**
 * Creates binding builder to build a binding between a KeysPressure interaction (done on a Node) and the given command type.
 * Do not forget to call bind() at the end of the build to execute the builder.
 * @param cmd The anonymous command to produce.
 * @return The binding builder. Cannot be null.
 * @throws IllegalArgumentException If the given cmd is null.
 */
export function anonCmdBinder(cmd: () => void): CmdBinder<AnonCmd> {
    return new AnonCmdBinder(cmd);
}

/**
 * Creates binding builder to build a binding between a button interaction and the given command type.
 * Do not forget to call bind() at the end of the build to execute the builder.
 * @return The binding builder.
 */
export function buttonBinder<C extends Command>(): InteractionBinder<ButtonPressed, WidgetData<HTMLButtonElement>> {
    return new UpdateBinder<C, ButtonPressed, WidgetData<HTMLButtonElement>>(0, false, false)
        .usingInteraction<ButtonPressed, WidgetData<HTMLButtonElement>>(() => new ButtonPressed());
}

export function checkboxBinder<C extends Command>(): InteractionBinder<BoxChecked, WidgetData<HTMLInputElement>> {
    return new UpdateBinder<C, BoxChecked, WidgetData<HTMLInputElement>>(0, false, false)
        .usingInteraction<BoxChecked, WidgetData<HTMLInputElement>>(() => new BoxChecked());
}

export function colorPickerBinder<C extends Command>(): InteractionBinder<ColorPicked, WidgetData<HTMLInputElement>> {
    return new UpdateBinder<C, ColorPicked, WidgetData<HTMLInputElement>>(0, false, false)
        .usingInteraction<ColorPicked, WidgetData<HTMLInputElement>>(() => new ColorPicked());
}

export function comboBoxBinder<C extends Command>(): InteractionBinder<ComboBoxSelected, WidgetData<HTMLSelectElement>> {
    return new UpdateBinder<C, ComboBoxSelected, WidgetData<HTMLSelectElement>>(0, false, false)
        .usingInteraction<ComboBoxSelected, WidgetData<HTMLSelectElement>>(() => new ComboBoxSelected());
}

export function spinnerBinder<C extends Command>(): InteractionUpdateBinder<SpinnerChanged, WidgetData<HTMLInputElement>> {
    return new UpdateBinder<C, SpinnerChanged, WidgetData<HTMLInputElement>>(0, false, false)
        .usingInteraction<SpinnerChanged, WidgetData<HTMLInputElement>>(() => new SpinnerChanged());
}

export function dateBinder<C extends Command>(): InteractionUpdateBinder<DatePicked, WidgetData<HTMLInputElement>> {
    return new UpdateBinder<C, DatePicked, WidgetData<HTMLInputElement>>(0, false, false)
        .usingInteraction<DatePicked, WidgetData<HTMLInputElement>>(() => new DatePicked());
}
