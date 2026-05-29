pub fn init_edge() {
    println!("Edge Library Initialized");
}

#[no_mangle]
pub extern "C" fn edge_process() {
    println!("Edge Processing Started");
}
