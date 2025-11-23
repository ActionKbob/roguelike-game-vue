import {
	f32,
	u8,
	u16,	
	i32
} from 'bitecs/serialization';

export const Position = { x: f32([]), y: f32([]) };

export const Rotation = { value : f32([]) };

export const Renderable = { texture: u8([]), frame: u16([]) };

export const Sprite = {};
export const Blitter = {};

export const MapMarker = { x: i32([]), y: i32([]) };