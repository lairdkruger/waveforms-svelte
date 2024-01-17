use wasm_bindgen::prelude::*;

pub fn main() {
    let x = String::from("Hello, world!");
    println!("{}", x)
}

#[wasm_bindgen]
extern {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, wasm-game-of-life!");
}