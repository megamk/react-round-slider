import { useEffect } from 'react';
import { Vector2 } from 'mz-math';
import {
    DEFAULT_BG_COLOR, DEFAULT_CONNECTION_BG_COLOR,
    DEFAULT_STROKE_WIDTH,
    DEFAULT_SVG_RX,
    DEFAULT_SVG_RY, POINTER_OVERLAP_DEFAULT
} from '../domain/defaults';
import { IState, IUserSettings } from '../interfaces';
import { useAppDispatch, useAppSelector } from '../data/store';
import { sliderActions } from '../data/slider-slice';
import { getBoolean, getNumber, getString } from '../domain/common';
import {
    getEllipseSegment,
    getSVGCenter,
    getSVGSize,
    getMaxPointer,
    getMinMax,
    getStep, getInitialPointers
} from '../domain/slider-provider';
import { normalizeAngles } from '../domain/angles-provider';
import { Slider } from './Slider';

/**
 * Wrapper is used to combine user settings with the defaults,
 * and add them to the redux store.
 */
export const Wrapper = (props: IUserSettings) => {

    const pointers = useAppSelector(store => store.slider.pointers);
    const dispatch = useAppDispatch();

    /**
     * Combine user settings with the defaults,
     * and init slider state properties.
     */
    useEffect(() => {
        // Define initial SVG circle/ellipse radii.
        const svgRadii: Vector2 = [
            getNumber(props.rx, DEFAULT_SVG_RX),
            getNumber(props.ry, DEFAULT_SVG_RY)
        ];

        // Define ellipse/circle segment using angles defined in degrees.
        const [startAngleDegrees, endAngleDegrees] = normalizeAngles(props.startAngleDegrees, props.endAngleDegrees);
        const angles: Vector2 = [startAngleDegrees, endAngleDegrees];

        const strokeWidth = getNumber(props.strokeWidth, DEFAULT_STROKE_WIDTH);
        const bgColor = getString(props.bgColor, DEFAULT_BG_COLOR);
        const connectionBgColor = getString(props.connectionBgColor, DEFAULT_CONNECTION_BG_COLOR);

        const [min, max] = getMinMax(props.min, props.max, props.data);
        const step = getStep(props.step, min, max);

        // Convert user provided pointers settings to the actual state pointers' definition.
        const _pointers = props.pointers ? getInitialPointers(props.pointers, min, max, props.data) : pointers;

        const maxPointer: Vector2 = getMaxPointer(_pointers);
        const svgSize: Vector2 = getSVGSize(svgRadii, maxPointer, strokeWidth);
        const svgCenter: Vector2 = getSVGCenter(svgRadii, maxPointer, strokeWidth);

        const { sliderStartPoint, sliderEndPoint, largeArcFlag } = getEllipseSegment(
            startAngleDegrees,
            endAngleDegrees,
            svgRadii,
            maxPointer,
            strokeWidth
        );

        const settings : IState = {
            // svg look & feel properties ---------
            svgRadii,
            angles,
            strokeWidth,
            bgColor,
            connectionBgColor,

            // data --------------------------------
            min,
            max,
            step,

            // pointers ----------------------------
            pointers: _pointers,
            selectedPointerId: null,
            pointersOverlap: getBoolean(props.pointersOverlap, POINTER_OVERLAP_DEFAULT),
            pointersMinDistance: getNumber(props.pointersMinDistance, 0),
            pointersMaxDistance: getNumber(props.pointersMaxDistance, Infinity),

            // calculated properties ---------------
            svgSize,
            svgCenter,
            sliderStartPoint,
            sliderEndPoint,
            largeArcFlag,
        };

        dispatch(
            sliderActions.onSettingsInit(settings)
        );
    },
        // Including pointers to the deps array causes an infinite loop.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    [
        dispatch, props.bgColor,
        props.connectionBgColor, props.data, props.endAngleDegrees,
        props.max, props.min, props.pointers, props.pointersMaxDistance,
        props.pointersMinDistance, props.pointersOverlap, props.rx, props.ry,
        props.startAngleDegrees, props.step, props.strokeWidth,
    ]);

    return (
        <Slider />
    )
};