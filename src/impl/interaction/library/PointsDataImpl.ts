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

import {PointsData} from "../../../api/interaction/PointsData";
import {PointDataImpl} from "./PointDataImpl";
import {PointData} from "../../../api/interaction/PointData";

export class PointsDataImpl extends PointDataImpl implements PointsData {
    /** The current position of the pointing device. */
    protected currentPosition: [number, number] | undefined;

    protected readonly pointsData: Array<PointData>;

    public constructor() {
        super();
        this.pointsData = [];
    }

    public getPointsData(): Array<PointData> {
        return [...this.pointsData];
    }

    public getCurrentPosition(): [number, number] | undefined {
        return this.currentPosition;
    }

    public setCurrentPosition(currentPosition: [number, number]): void {
        this.currentPosition = currentPosition;
    }

    public getLastButton(): number | undefined {
        return this.pointsData.length === 0 ? undefined : this.pointsData[this.pointsData.length - 1].getButton();
    }

    public addPoint(ptData: PointData): void {
        this.pointsData.push(ptData);
    }

    public flush(): void {
        this.pointsData.length = 0;
        this.currentPosition = undefined;
    }
}