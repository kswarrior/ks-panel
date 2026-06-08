use napi_derive::napi;

#[napi]
pub fn hello_world() -> String {
    "Hello from KS Panel Native Addon!".to_string()
}
