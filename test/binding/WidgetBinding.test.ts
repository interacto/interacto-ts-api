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

import type {
    InteractionData,
    Undoable, UndoHistory
} from "../../src/interacto";
import {
    CancelFSMException,
    catBinding,
    catCommand,
    catFSM, catInteraction,
    CmdStatus,
    FSMImpl,
    MustBeUndoableCmdError,
    BindingImpl, UndoHistoryImpl
} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";
import {InteractionStub} from "../interaction/InteractionStub";


class BindingStub extends BindingImpl<StubCmd, InteractionStub, InteractionData> {
    public conditionRespected: boolean;

    public mustCancel: boolean;


    public constructor(history: UndoHistory, continuous: boolean, cmdCreation: (i?: InteractionData) => StubCmd,
                       interaction: InteractionStub) {
        super(continuous, interaction, cmdCreation, [], history);
        this.conditionRespected = false;
        this.mustCancel = false;
    }

    public when(): boolean {
        return this.conditionRespected;
    }

    public isStrictStart(): boolean {
        return this.mustCancel;
    }
}

class CmdStubUndoable extends StubCmd implements Undoable {
    public hadEffect(): boolean {
        return true;
    }

    public canExecute(): boolean {
        return true;
    }

    public undo(): void {
    }

    public redo(): void {
    }

    public getUndoName(): string {
        return "";
    }

    public getVisualSnapshot(): SVGElement | string | undefined {
        return undefined;
    }
}

let binding: BindingStub;
let history: UndoHistory;

beforeEach(() => {
    history = new UndoHistoryImpl();
    jest.spyOn(catBinding, "error");
    jest.spyOn(catBinding, "warn");
    jest.spyOn(catFSM, "error");
    jest.spyOn(catCommand, "error");
    jest.spyOn(catInteraction, "error");
    binding = new BindingStub(history, false, () => new StubCmd(), new InteractionStub(new FSMImpl()));
    binding.setActivated(true);
});

afterEach(() => {
    history.clear();
    jest.clearAllMocks();
});

describe("nominal cases", () => {
    afterEach(() => {
        // eslint-disable-next-line jest/no-standalone-expect
        expect(catInteraction.error).not.toHaveBeenCalled();
        // eslint-disable-next-line jest/no-standalone-expect
        expect(catCommand.error).not.toHaveBeenCalled();
        // eslint-disable-next-line jest/no-standalone-expect
        expect(catBinding.error).not.toHaveBeenCalled();
        // eslint-disable-next-line jest/no-standalone-expect
        expect(catFSM.error).not.toHaveBeenCalled();
    });

    test("testLinkDeActivation", () => {
        binding.setActivated(true);
        binding.setActivated(false);
        expect(binding.isActivated()).toBeFalsy();
    });

    test("testLinkActivation", () => {
        binding.setActivated(false);
        binding.setActivated(true);
        expect(binding.isActivated()).toBeTruthy();
    });

    test("testExecuteNope", () => {
        expect(binding.isContinuousCmdExec()).toBeFalsy();
    });

    test("testExecuteOK", () => {
        binding = new BindingStub(history, true, () => new StubCmd(), new InteractionStub(new FSMImpl()));
        expect(binding.isContinuousCmdExec()).toBeTruthy();
    });

    test("testIsInteractionMustBeCancelled", () => {
        expect(binding.isStrictStart()).toBeFalsy();
    });

    test("testNotRunning", () => {
        expect(binding.isRunning()).toBeFalsy();
    });

    test("testInteractionCancelsWhenNotStarted", () => {
        binding.fsmCancels();
        expect(binding.getCommand()).toBeUndefined();
    });

    test("testInteractionUpdatesWhenNotStarted", () => {
        binding.fsmUpdates();
        expect(binding.getCommand()).toBeUndefined();
    });

    test("testInteractionStopsWhenNotStarted", () => {
        binding.fsmStops();
        expect(binding.getCommand()).toBeUndefined();
    });

    test("testInteractionStartsWhenNoCorrectInteractionNotActivated", () => {
        binding.mustCancel = false;
        binding.setActivated(false);
        binding.fsmStarts();
        expect(binding.getCommand()).toBeUndefined();
    });

    test("testInteractionStartsWhenNoCorrectInteractionActivated", () => {
        binding.mustCancel = false;
        binding.conditionRespected = false;
        binding.fsmStarts();
        expect(binding.getCommand()).toBeUndefined();
    });

    test("interaction starts throw MustCancelStateMachineException", () => {
        binding.mustCancel = true;
        expect(() => {
            binding.fsmStarts();
        }).toThrow(CancelFSMException);
    });

    test("interaction starts throw MustCancelStateMachineException with log", () => {
        binding.mustCancel = true;
        binding.setLogBinding(true);
        expect(() => {
            binding.fsmStarts();
        }).toThrow(CancelFSMException);
    });

    test("testInteractionStartsOk", () => {
        binding.conditionRespected = true;
        binding.fsmStarts();
        expect(binding.getCommand()).toBeDefined();
    });

    test("testCounters", () => {
        expect(binding.getTimesEnded()).toStrictEqual(0);
        expect(binding.getTimesCancelled()).toStrictEqual(0);
    });

    test("testCounterEndedOnce", () => {
        binding.conditionRespected = true;
        binding.fsmStarts();
        binding.fsmStops();
        expect(binding.getTimesEnded()).toStrictEqual(1);
        expect(binding.getTimesCancelled()).toStrictEqual(0);
    });

    test("testCounterEndedTwice", () => {
        binding.conditionRespected = true;
        binding.fsmStarts();
        binding.fsmStops();
        binding.fsmStarts();
        binding.fsmStops();
        expect(binding.getTimesEnded()).toStrictEqual(2);
        expect(binding.getTimesCancelled()).toStrictEqual(0);
    });

    test("testCounterCancelledOnce", () => {
        binding.conditionRespected = true;
        binding.fsmStarts();
        binding.fsmCancels();
        expect(binding.getTimesCancelled()).toStrictEqual(1);
        expect(binding.getTimesEnded()).toStrictEqual(0);
    });

    test("testCounterCancelledTwice", () => {
        binding.conditionRespected = true;
        binding.fsmStarts();
        binding.fsmCancels();
        binding.fsmStarts();
        binding.fsmCancels();
        expect(binding.getTimesCancelled()).toStrictEqual(2);
        expect(binding.getTimesEnded()).toStrictEqual(0);
    });

    test("clear events", () => {
        jest.spyOn(binding.getInteraction(), "fullReinit");
        binding.clearEvents();
        expect(binding.getInteraction().fullReinit).toHaveBeenCalledTimes(1);
    });

    test("cancel interaction", () => {
        binding.conditionRespected = true;
        binding.setLogBinding(true);
        binding.setLogCmd(true);
        binding.fsmStarts();
        const cmd = binding.getCommand();
        jest.spyOn(binding, "cancel");
        jest.spyOn(binding, "endOrCancel");
        binding.fsmCancels();
        binding.fsmCancels();
        binding.fsmCancels();
        expect(cmd).toBeDefined();
        expect(cmd?.getStatus()).toStrictEqual(CmdStatus.cancelled);
        expect(binding.endOrCancel).toHaveBeenCalledWith();
        expect(binding.cancel).toHaveBeenCalledTimes(1);
        expect(binding.getCommand()).toBeUndefined();
    });

    test("cancel interaction two times", () => {
        binding.conditionRespected = true;
        jest.spyOn(binding, "cancel");
        binding.fsmStarts();
        binding.fsmCancels();
        binding.fsmStarts();
        binding.fsmCancels();
        expect(binding.cancel).toHaveBeenCalledTimes(2);
    });

    test("cancel interaction continuous", () => {
        binding = new BindingStub(history, true, () => new StubCmd(), new InteractionStub(new FSMImpl()));
        binding.conditionRespected = true;
        binding.fsmStarts();
        // eslint-disable-next-line no-unused-expressions
        binding.getCommand()?.done();
        expect(() => {
            binding.fsmCancels();
        }).toThrow(MustBeUndoableCmdError);
    });

    test("cancel interaction continuous no effect", () => {
        binding = new BindingStub(history, true, () => new StubCmd(), new InteractionStub(new FSMImpl()));
        binding.conditionRespected = true;
        binding.fsmStarts();
        const cmd = binding.getCommand();
        binding.fsmCancels();
        expect(CmdStatus.cancelled).toStrictEqual(cmd?.getStatus());
    });

    test("cancel interaction continuous undoable", () => {
        const cmd = new CmdStubUndoable();
        jest.spyOn(cmd, "undo");
        binding = new BindingStub(history, true, () => cmd, new InteractionStub(new FSMImpl()));
        binding.conditionRespected = true;
        binding.setLogCmd(true);
        binding.fsmStarts();
        binding.fsmCancels();
        expect(cmd.undo).toHaveBeenCalledTimes(1);
    });

    test("cancel interaction continuous undoable no log", () => {
        const cmd = new CmdStubUndoable();
        jest.spyOn(cmd, "undo");
        binding = new BindingStub(history, true, () => cmd, new InteractionStub(new FSMImpl()));
        binding.conditionRespected = true;
        binding.fsmStarts();
        binding.fsmCancels();
        expect(cmd.undo).toHaveBeenCalledTimes(1);
    });

    test("update activated with log cmd not ok", () => {
        jest.spyOn(binding, "then");
        binding.conditionRespected = false;
        binding.setLogBinding(true);
        binding.fsmStarts();
        binding.fsmUpdates();
        expect(binding.then).not.toHaveBeenCalledWith();
    });

    test("update activated no log cmd ok", () => {
        jest.spyOn(binding, "then");
        binding.conditionRespected = true;
        binding.fsmStarts();
        binding.fsmUpdates();
        expect(binding.then).toHaveBeenCalledWith();
    });

    test("update activated with log cmd ok", () => {
        jest.spyOn(binding, "then");
        binding.conditionRespected = true;
        binding.setLogCmd(true);
        binding.fsmStarts();
        binding.fsmUpdates();
        expect(binding.then).toHaveBeenCalledWith();
    });

    test("update not activated", () => {
        binding.conditionRespected = true;
        binding.fsmStarts();
        jest.spyOn(binding, "first");
        jest.spyOn(binding, "then");
        binding.setActivated(false);
        binding.fsmUpdates();
        expect(binding.first).not.toHaveBeenCalledWith();
        expect(binding.then).not.toHaveBeenCalledWith();
    });

    test("update when cmd not created", () => {
        jest.spyOn(binding, "first");
        binding.conditionRespected = false;
        binding.fsmStarts();
        binding.setLogCmd(true);
        binding.conditionRespected = true;
        binding.fsmUpdates();
        expect(binding.first).toHaveBeenCalledWith();
        expect(binding.getCommand()).toBeDefined();
    });

    test("update continuous with log cannotDo", () => {
        binding = new BindingStub(history, true, () => new StubCmd(), new InteractionStub(new FSMImpl()));
        jest.spyOn(binding, "ifCannotExecuteCmd");
        binding.conditionRespected = true;
        binding.setLogCmd(true);
        binding.fsmStarts();
        (binding.getCommand() as StubCmd).candoValue = false;
        binding.fsmUpdates();
        expect(binding.ifCannotExecuteCmd).toHaveBeenCalledWith();
        expect(binding.getCommand()?.exec).toStrictEqual(0);
    });

    test("update continuous not log canDo", () => {
        binding = new BindingStub(history, true, () => new StubCmd(), new InteractionStub(new FSMImpl()));
        jest.spyOn(binding, "ifCannotExecuteCmd");
        binding.conditionRespected = true;
        binding.fsmStarts();
        (binding.getCommand() as StubCmd).candoValue = true;
        binding.fsmUpdates();
        expect(binding.ifCannotExecuteCmd).not.toHaveBeenCalledWith();
        expect(binding.getCommand()?.exec).toStrictEqual(1);
    });

    test("stop no log cmd created", () => {
        binding.conditionRespected = true;
        binding.fsmStarts();
        const cmd = binding.getCommand();
        binding.conditionRespected = false;
        binding.fsmStops();
        expect(cmd?.getStatus()).toStrictEqual(CmdStatus.cancelled);
        expect(binding.getCommand()).toBeUndefined();
        expect(binding.getTimesCancelled()).toStrictEqual(1);
    });

    test("stop no cmd created", () => {
        binding.conditionRespected = false;
        binding.fsmStarts();
        binding.fsmStops();
        expect(binding.getCommand()).toBeUndefined();
        expect(binding.getTimesCancelled()).toStrictEqual(0);
    });

    test("stop with log cmd created and cancelled two times", () => {
        binding.conditionRespected = true;
        binding.setLogCmd(true);
        binding.fsmStarts();
        binding.conditionRespected = false;
        binding.fsmStops();
        binding.conditionRespected = true;
        binding.fsmStarts();
        binding.conditionRespected = false;
        binding.fsmStops();
        expect(binding.getTimesCancelled()).toStrictEqual(2);
    });

    test("uninstall Binding", () => {
        jest.spyOn(binding.getInteraction(), "uninstall");
        binding.uninstallBinding();
        expect(binding.isActivated()).toBeFalsy();
        expect(binding.getInteraction().uninstall).toHaveBeenCalledTimes(1);
    });
});


describe("crash in binding", () => {
    afterEach(() => {
        // eslint-disable-next-line jest/no-standalone-expect
        expect(catInteraction.error).not.toHaveBeenCalled();
        // eslint-disable-next-line jest/no-standalone-expect
        expect(catCommand.error).not.toHaveBeenCalled();
        // eslint-disable-next-line jest/no-standalone-expect
        expect(catFSM.error).not.toHaveBeenCalled();
    });

    test("execute crash with an error", () => {
        const ex = new Error();
        const supplier = (): StubCmd => {
            throw ex;
        };

        binding = new BindingStub(history, true, supplier, new InteractionStub(new FSMImpl()));
        binding.conditionRespected = true;
        jest.spyOn(binding, "first");
        binding.fsmStarts();
        expect(binding.getCommand()).toBeUndefined();
        expect(catBinding.error).toHaveBeenCalledWith("Error while creating a command", ex);
        expect(binding.first).not.toHaveBeenCalled();
    });

    test("execute crash with not an error", () => {
        const supplier = (): StubCmd => {
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw "yolo";
        };

        binding = new BindingStub(history, true, supplier, new InteractionStub(new FSMImpl()));
        binding.conditionRespected = true;
        jest.spyOn(binding, "first");
        binding.fsmStarts();
        expect(binding.getCommand()).toBeUndefined();
        expect(catBinding.warn).toHaveBeenCalledWith("Error while creating a command: yolo");
        expect(binding.first).not.toHaveBeenCalled();
    });

    test("execute crash and interaction stops", () => {
        const ex = new Error();
        const supplier = (): StubCmd => {
            throw ex;
        };

        binding = new BindingStub(history, true, supplier, new InteractionStub(new FSMImpl()));
        binding.conditionRespected = true;
        binding.fsmStops();
        expect(catBinding.error).toHaveBeenCalledWith("Error while creating a command", ex);
        expect(binding.getCommand()).toBeUndefined();
    });

    test("update with cmd crash", () => {
        const ex = new Error();
        const supplier = (): StubCmd => {
            throw ex;
        };
        binding = new BindingStub(history, true, supplier, new InteractionStub(new FSMImpl()));
        jest.spyOn(binding, "first");
        binding.conditionRespected = false;
        binding.fsmStarts();
        binding.conditionRespected = true;
        binding.fsmUpdates();
        expect(catBinding.error).toHaveBeenCalledWith("Error while creating a command", ex);
        expect(binding.first).not.toHaveBeenCalledWith();
        expect(binding.getCommand()).toBeUndefined();
    });
});
