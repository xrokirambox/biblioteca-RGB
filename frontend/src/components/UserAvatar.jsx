import React from "react";

export function UserAvatar({ user, size = "md" }) {
  if (!user) return null;

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email?.[0]?.toUpperCase() || "?";

  const photoUrl = user.profile_photo_url
    ? user.profile_photo_url.includes("drive.google.com")
      ? `https://lh3.googleusercontent.com/d/${
          user.profile_photo_url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]
        }=s100`
      : user.profile_photo_url
    : null;

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-[#051a09] border border-[#c9a227]/30 flex items-center justify-center text-[#c9a227] font-dm-sans font-semibold`}>
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={user.name || user.email}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      ) : null}
      <span className={photoUrl ? "hidden" : ""}>{initials}</span>
    </div>
  );
}
