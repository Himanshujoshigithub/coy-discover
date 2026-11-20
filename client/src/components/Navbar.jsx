
import { House, Compass, Heart } from "lucide-react";

function Navbar({ activeTab, onTabChange }) {
    const tabs = [
        { id: "home", label: "Home", icon: House },
        { id: "discover", label: "Discover", icon: Compass },
        { id: "matches", label: "Matches", icon: Heart }
    ];

    return (
        <nav className="navbar">
            <div className="nav-brand">
                discover<span>.</span>
            </div>

            <div className="nav-tabs">
                {tabs.map((tab) => {
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            className={
                                activeTab === tab.id
                                    ? "nav-button active"
                                    : "nav-button"
                            }
                            onClick={() => onTabChange(tab.id)}
                        >
                            <Icon size={19} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}

export default Navbar;
