Calendar shows user the data about events
It has some parameters for user to change representation of data
- Date view - how to present time on calendar
-- Months: Months are listed like rows, panels of events are presented in month panel in chronological order
-- Weeks: weeks are listed like rows under month block. Event panels are located in week panel in chronological order
-- Days: simple calendar with dates in table. X-axis is days of the week, starting from monday. Event panel are stretch across day panels

In all date view, user can scroll up and down

Scope - filtering events by size:
- world
- Russia
- Region
- local

Type - filtering events by type:
- competition
- festival
- batizado
- camp
- coach only



Event panel - is visualization of data about event. It has next parameters, taken from DB:
- Name 
- Start date, end date
- Place
- Type
- Scope

When visualizing event panel on calendar it contains:
- event name on it
- panel has color depending on scope. For mvp we do red for world events, blue for Russia, green for region, yellow for local


If user click on event panel, he get pop-up window with short information and link to event page.
Pressing on link to event page he is redirected to full event page will all information about event.