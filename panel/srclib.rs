#![deny(clippy::all)]

use napi_derive::napi;

#[napi]
pub fn sum(a: i32, b: i32) -> i32 {
  a + b
}

#[napi]
pub fn get_version() -> String {
  env!("CARGO_PKG_VERSION").to_string()
}
