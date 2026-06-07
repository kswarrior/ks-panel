use napi_derive::napi;
use sysinfo::{DiskExt, System, SystemExt};

#[napi]
pub fn scan_heavy_duty() -> String {
    "Scanning... Done.".to_string()
}

#[napi]
pub fn get_disk_info() -> String {
    let mut sys = System::new_all();
    sys.refresh_disks();

    let mut total = 0;
    let mut available = 0;

    for disk in sys.disks() {
        total += disk.total_space();
        available += disk.available_space();
    }

    let used = total - available;
    let percent = if total > 0 {
        (used as f64 / total as f64) * 100.0
    } else {
        0.0
    };

    format!("{:.2}GB,{:.2}GB,{:.1}%",
        used as f64 / 1024.0 / 1024.0 / 1024.0,
        total as f64 / 1024.0 / 1024.0 / 1024.0,
        percent
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        assert_eq!(scan_heavy_duty(), "Scanning... Done.");
    }
}
