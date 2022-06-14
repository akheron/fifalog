use serde::{Deserialize, Serialize};
use tokio_postgres::types::private::BytesMut;
use tokio_postgres::types::{to_sql_checked, FromSql, IsNull, ToSql, Type};

#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq, Deserialize, Serialize)]
#[serde(transparent)]
pub struct MatchId(pub i32);
impl<'a> FromSql<'a> for MatchId {
    fn from_sql(
        ty: &Type,
        raw: &'a [u8],
    ) -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        let inner: i32 = i32::from_sql(ty, raw)?;
        Ok(Self(inner))
    }
    fn accepts(ty: &Type) -> bool {
        <i32 as FromSql>::accepts(ty)
    }
}
impl ToSql for MatchId {
    fn to_sql(
        &self,
        ty: &Type,
        out: &mut BytesMut,
    ) -> Result<IsNull, Box<dyn std::error::Error + Sync + Send>>
    where
        Self: Sized,
    {
        self.0.to_sql(ty, out)
    }
    fn accepts(ty: &Type) -> bool
    where
        Self: Sized,
    {
        <i32 as ToSql>::accepts(ty)
    }
    to_sql_checked!();
}

#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq, Deserialize, Serialize)]
#[serde(transparent)]
pub struct TeamId(pub i32);
impl<'a> FromSql<'a> for TeamId {
    fn from_sql(
        ty: &Type,
        raw: &'a [u8],
    ) -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        let inner: i32 = i32::from_sql(ty, raw)?;
        Ok(Self(inner))
    }
    fn accepts(ty: &Type) -> bool {
        <i32 as FromSql>::accepts(ty)
    }
}
impl ToSql for TeamId {
    fn to_sql(
        &self,
        ty: &Type,
        out: &mut BytesMut,
    ) -> Result<IsNull, Box<dyn std::error::Error + Sync + Send>>
    where
        Self: Sized,
    {
        self.0.to_sql(ty, out)
    }
    fn accepts(ty: &Type) -> bool
    where
        Self: Sized,
    {
        <i32 as ToSql>::accepts(ty)
    }
    to_sql_checked!();
}

#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq, Deserialize, Serialize)]
#[serde(transparent)]
pub struct LeagueId(pub i32);
impl<'a> FromSql<'a> for LeagueId {
    fn from_sql(
        ty: &Type,
        raw: &'a [u8],
    ) -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        let inner: i32 = i32::from_sql(ty, raw)?;
        Ok(Self(inner))
    }
    fn accepts(ty: &Type) -> bool {
        <i32 as FromSql>::accepts(ty)
    }
}
impl ToSql for LeagueId {
    fn to_sql(
        &self,
        ty: &Type,
        out: &mut BytesMut,
    ) -> Result<IsNull, Box<dyn std::error::Error + Sync + Send>>
    where
        Self: Sized,
    {
        self.0.to_sql(ty, out)
    }
    fn accepts(ty: &Type) -> bool
    where
        Self: Sized,
    {
        <i32 as ToSql>::accepts(ty)
    }
    to_sql_checked!();
}

#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq, Deserialize, Serialize)]
#[serde(transparent)]
pub struct UserId(pub i32);
impl<'a> FromSql<'a> for UserId {
    fn from_sql(
        ty: &Type,
        raw: &'a [u8],
    ) -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        let inner: i32 = i32::from_sql(ty, raw)?;
        Ok(Self(inner))
    }
    fn accepts(ty: &Type) -> bool {
        <i32 as FromSql>::accepts(ty)
    }
}
impl ToSql for UserId {
    fn to_sql(
        &self,
        ty: &Type,
        out: &mut BytesMut,
    ) -> Result<IsNull, Box<dyn std::error::Error + Sync + Send>>
    where
        Self: Sized,
    {
        self.0.to_sql(ty, out)
    }
    fn accepts(ty: &Type) -> bool
    where
        Self: Sized,
    {
        <i32 as ToSql>::accepts(ty)
    }
    to_sql_checked!();
}

#[derive(Debug)]
pub enum FinishedType {
    FullTime,
    OverTime,
    Penalties,
}

impl<'a> FromSql<'a> for FinishedType {
    fn from_sql(
        _ty: &Type,
        raw: &'a [u8],
    ) -> Result<Self, Box<dyn std::error::Error + Sync + Send>> {
        match raw {
            b"fullTime" => Ok(FinishedType::FullTime),
            b"overTime" => Ok(FinishedType::OverTime),
            b"penalties" => Ok(FinishedType::Penalties),
            _ => panic!("todo"),
        }
    }
    fn accepts(ty: &Type) -> bool {
        ty.schema() == "public" && ty.name() == "finished_type"
    }
}

impl ToSql for FinishedType {
    fn to_sql(
        &self,
        _ty: &Type,
        out: &mut BytesMut,
    ) -> Result<IsNull, Box<dyn std::error::Error + Sync + Send>>
    where
        Self: Sized,
    {
        match self {
            FinishedType::FullTime => out.extend_from_slice(b"fullTime"),
            FinishedType::OverTime => out.extend_from_slice(b"overTime"),
            FinishedType::Penalties => out.extend_from_slice(b"penalties"),
        }
        Ok(IsNull::No)
    }

    fn accepts(ty: &Type) -> bool
    where
        Self: Sized,
    {
        ty.schema() == "public" && ty.name() == "finished_type"
    }

    to_sql_checked!();
}
